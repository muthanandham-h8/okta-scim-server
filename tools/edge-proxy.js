/**
 * Local reverse proxy for ngrok free tier (single public URL) + demo tap.
 *
 * ngrok  ->  http://localhost:8088 (this proxy)  ->  by path:
 *   /scim/*, /docs*, /demo*  ->  SCIM server (:3000)
 *   everything else          ->  Keycloak    (:8080)   (/realms, /resources, /admin, ...)
 *
 * For the two "interesting" flows it captures the full exchange and posts
 * structured events to the SCIM server's demo buffer so the /demo dashboard can
 * show, actor-by-actor, what Okta sent and what came back:
 *   - POST /realms/.../protocol/openid-connect/token   (Okta <-> Keycloak)
 *   - /scim/v2/*                                        (Okta <-> SCIM server)
 * Everything else is streamed through untouched (admin console, JWKS, assets).
 *
 * Sets X-Forwarded-Proto=https so Keycloak (KC_PROXY_HEADERS=xforwarded) knows
 * the public side is TLS, even though ngrok reaches us over plain http.
 */
const http = require('http');
const httpProxy = require('http-proxy');
const { URL, URLSearchParams } = require('url');

const KEYCLOAK = 'http://localhost:8080';
const SCIM = 'http://localhost:3000';
// Single source: start.mjs sets PUBLIC_HOST from .env's PUBLIC_BASE_URL. If run
// standalone, fall back to deriving the host from PUBLIC_BASE_URL, else local.
const PUBLIC_HOST =
  process.env.PUBLIC_HOST ||
  (process.env.PUBLIC_BASE_URL
    ? process.env.PUBLIC_BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '')
    : 'localhost:8088');
const PORT = Number(process.env.EDGE_PORT || 8088);
const EVENT_SINK = process.env.EVENT_SINK || 'http://localhost:3000/demo/internal/events';

// ---------------------------------------------------------------- event tap ---
function emit(event) {
  try {
    const data = Buffer.from(JSON.stringify(event));
    const u = new URL(EVENT_SINK);
    const req = http.request(
      { hostname: u.hostname, port: u.port, path: u.pathname, method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } },
      (r) => r.resume(),
    );
    req.on('error', () => {});
    req.end(data);
  } catch { /* never let logging break the proxy */ }
}

function shortToken(v) {
  if (typeof v !== 'string' || v.length <= 24) return v;
  return `${v.slice(0, 12)}…${v.slice(-6)} (${v.length} chars)`;
}

const SECRET_KEYS = new Set(['client_secret', 'password']);
const TOKEN_KEYS = new Set(['access_token', 'refresh_token', 'id_token']);

function redact(obj) {
  if (!obj || typeof obj !== 'object') return obj;
  const out = Array.isArray(obj) ? [] : {};
  for (const k of Object.keys(obj)) {
    const lk = k.toLowerCase();
    const v = obj[k];
    if (SECRET_KEYS.has(lk)) out[k] = '***';
    else if (TOKEN_KEYS.has(lk)) out[k] = shortToken(v);
    else if (v && typeof v === 'object') out[k] = redact(v);
    else out[k] = v;
  }
  return out;
}

function parseBody(contentType, buf) {
  const text = buf.toString('utf8');
  if (!text) return undefined;
  const ct = contentType || '';
  try {
    if (ct.includes('x-www-form-urlencoded')) {
      const params = {};
      new URLSearchParams(text).forEach((val, key) => { params[key] = val; });
      return redact(params);
    }
    return redact(JSON.parse(text)); // json / scim+json / best-effort
  } catch {
    return text.length > 600 ? `${text.slice(0, 600)}…` : text;
  }
}

function pickHeaders(h) {
  const out = {};
  if (h['content-type']) out['content-type'] = h['content-type'];
  if (h['authorization']) {
    out['authorization'] = `Bearer ${shortToken(String(h['authorization']).replace(/^Bearer\s+/i, ''))}`;
  }
  return out;
}

// --------------------------------------------------------------- proxying ---
const passthrough = httpProxy.createProxyServer({});
passthrough.on('proxyReq', (proxyReq) => {
  proxyReq.setHeader('X-Forwarded-Proto', 'https');
  proxyReq.setHeader('X-Forwarded-Host', PUBLIC_HOST);
  proxyReq.setHeader('X-Forwarded-Port', '443');
});
passthrough.on('error', (err, req, res) => {
  if (res && !res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain' });
  if (res) res.end(`edge-proxy error: ${err.message}`);
});

const serviceFor = (url) => (url.startsWith('/scim') ? 'scim' : 'keycloak');
const routeToScim = (url) =>
  url.startsWith('/scim') || url.startsWith('/docs') || url.startsWith('/demo');
const shouldCapture = (url) =>
  url.startsWith('/scim/v2') || url.includes('/protocol/openid-connect/token');

// Buffered proxy that records request + response as demo events.
function captureProxy(req, res) {
  const service = serviceFor(req.url);
  const isScim = service === 'scim';
  const base = isScim ? SCIM : KEYCLOAK;
  const chunks = [];
  req.on('data', (c) => chunks.push(c));
  req.on('end', () => {
    const reqBody = Buffer.concat(chunks);

    emit({
      ts: new Date().toISOString(),
      source: 'okta',
      actor: isScim ? 'Okta → SCIM server' : 'Okta → Keycloak',
      kind: 'request',
      method: req.method,
      path: req.url,
      headers: pickHeaders(req.headers),
      payload: parseBody(req.headers['content-type'], reqBody),
    });

    const target = new URL(req.url, base);
    const headers = { ...req.headers, host: target.host };
    headers['x-forwarded-proto'] = 'https';
    headers['x-forwarded-host'] = PUBLIC_HOST;
    headers['x-forwarded-port'] = '443';
    delete headers['accept-encoding']; // keep responses uncompressed & readable

    const preq = http.request(
      { hostname: target.hostname, port: target.port || 80,
        path: target.pathname + target.search, method: req.method, headers },
      (pres) => {
        const rchunks = [];
        pres.on('data', (c) => rchunks.push(c));
        pres.on('end', () => {
          const resBody = Buffer.concat(rchunks);
          emit({
            ts: new Date().toISOString(),
            source: isScim ? 'scim' : 'keycloak',
            actor: isScim ? 'SCIM server → Okta' : 'Keycloak → Okta',
            kind: 'response',
            method: req.method,
            path: req.url,
            status: pres.statusCode,
            payload: parseBody(pres.headers['content-type'], resBody),
          });
          const outHeaders = { ...pres.headers };
          delete outHeaders['transfer-encoding'];
          delete outHeaders['content-length'];
          res.writeHead(pres.statusCode, outHeaders);
          res.end(resBody);
        });
      },
    );
    preq.on('error', (err) => {
      if (!res.headersSent) res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end(`edge-proxy error: ${err.message}`);
    });
    preq.end(reqBody);
  });
}

const server = http.createServer((req, res) => {
  const url = req.url || '/';
  if (shouldCapture(url)) return captureProxy(req, res);
  passthrough.web(req, res, { target: routeToScim(url) ? SCIM : KEYCLOAK });
});

server.listen(PORT, () => {
  console.log(`edge-proxy on :${PORT}`);
  console.log(`  /scim, /docs, /demo  -> ${SCIM}`);
  console.log(`  everything else      -> ${KEYCLOAK}`);
  console.log(`  capturing: /scim/v2/*, .../openid-connect/token  -> ${EVENT_SINK}`);
  console.log(`  public host: ${PUBLIC_HOST}`);
});
