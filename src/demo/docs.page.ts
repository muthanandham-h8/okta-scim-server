// Documentation served at /docs (index) and /docs/:method (runbook pages).
// Index: "How it works" + the four provisioning methods. Each method opens a
// separate runbook page with functions, capabilities, why / when-to-avoid, and
// the real inputs (client id/secret, endpoints) to copy.

export interface DocsConfig {
  scimBase: string;
  tokenEndpoint: string;
  authEndpoint: string;
  clientId: string;
  clientSecret: string;
  scope: string;
  buildId: string;
}

const esc = (s: string) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c] as string));
const val = (v: string) => `<code class="copy" data-v="${esc(v)}" title="Click to copy">${esc(v)}</code>`;

const CSS = /* css */ `
  :root{ --bg:#f4f6fb; --panel:#fff; --ink:#12203a; --muted:#5b6b85; --line:#e3e8f2; --brand:#1662dd;
    --ok-bg:#e5f6ec; --ok:#1c7a45; --off-bg:#fdeaea; --off:#b3261e; --chip:#eef2fb; --chip-ink:#33507f;
    --shadow:0 1px 3px rgba(18,32,58,.07),0 8px 24px rgba(18,32,58,.05); }
  @media (prefers-color-scheme:dark){ :root{ --bg:#0c1120; --panel:#121a2e; --ink:#e8eefb; --muted:#93a1bf;
    --line:#22304d; --brand:#4b8bf5; --ok-bg:#123726; --ok:#5fd490; --off-bg:#3a1615; --off:#f19b95;
    --chip:#1b2740; --chip-ink:#a8bce6; --shadow:0 1px 3px rgba(0,0,0,.4),0 10px 30px rgba(0,0,0,.3); } }
  *{box-sizing:border-box;} body{margin:0;background:var(--bg);color:var(--ink);
    font:15px/1.55 -apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;}
  .wrap{max-width:880px;margin:0 auto;padding:30px 22px 64px;}
  .top{display:flex;align-items:center;gap:12px;margin-bottom:8px;}
  h1{font-size:22px;margin:0;font-weight:650;letter-spacing:-.2px;} .top .grow{flex:1;}
  a.back{font-size:13px;color:var(--muted);text-decoration:none;} a.back:hover{color:var(--brand);}
  .intro{color:var(--muted);margin:0 0 30px;font-size:14px;}
  h2{font-size:12px;text-transform:uppercase;letter-spacing:.07em;color:var(--muted);margin:32px 0 12px;font-weight:600;}
  h3{font-size:16px;margin:20px 0 8px;}
  p{margin:0 0 12px;}
  ol.flow{margin:0;padding-left:0;list-style:none;counter-reset:s;}
  ol.flow li{position:relative;padding:0 0 12px 38px;counter-increment:s;}
  ol.flow li:last-child{padding-bottom:0;}
  ol.flow li::before{content:counter(s);position:absolute;left:0;top:-2px;width:25px;height:25px;border-radius:50%;
    background:var(--chip);color:var(--chip-ink);display:grid;place-items:center;font-weight:700;font-size:12px;}
  ol.flow b{color:var(--ink);} ol.flow span{color:var(--muted);}
  .cards{display:grid;grid-template-columns:1fr 1fr;gap:14px;}
  @media (max-width:640px){.cards{grid-template-columns:1fr;}}
  a.card{display:block;text-decoration:none;color:inherit;background:var(--panel);border:1px solid var(--line);
    border-radius:13px;padding:16px 18px;box-shadow:var(--shadow);transition:border-color .15s,transform .15s;}
  a.card:hover{border-color:var(--brand);transform:translateY(-1px);}
  .card .tag{display:inline-block;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px;margin-bottom:8px;}
  .tag.priv{background:var(--ok-bg);color:var(--ok);} .tag.pub{background:var(--chip);color:var(--chip-ink);}
  .card .nm{font-size:16px;font-weight:650;margin-bottom:3px;} .card .wt{color:var(--muted);font-size:13px;margin-bottom:10px;}
  .card .mini{font-size:12.5px;} .card .mini .g{color:var(--ok);font-weight:600;} .card .mini .r{color:var(--off);font-weight:600;}
  .card .open{color:var(--brand);font-size:13px;font-weight:600;margin-top:10px;}
  .card2{background:var(--panel);border:1px solid var(--line);border-radius:13px;padding:20px 22px;box-shadow:var(--shadow);margin-bottom:18px;}
  ul.list{margin:0;padding-left:0;list-style:none;} ul.list li{padding:7px 0 7px 24px;position:relative;border-bottom:1px solid var(--line);font-size:14px;}
  ul.list li:last-child{border-bottom:none;}
  ul.list.why li::before{content:'✓';position:absolute;left:0;color:var(--ok);font-weight:700;}
  ul.list.avoid li::before{content:'✕';position:absolute;left:0;color:var(--off);font-weight:700;}
  ul.list b{color:var(--ink);}
  .kv{display:grid;grid-template-columns:190px 1fr;gap:8px 14px;font-size:13.5px;}
  @media (max-width:560px){.kv{grid-template-columns:1fr;} .kv .k{margin-top:8px;}}
  .kv .k{color:var(--muted);}
  code{background:var(--chip);color:var(--chip-ink);padding:1px 6px;border-radius:5px;font-size:12.5px;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;}
  code.copy{cursor:pointer;border:1px solid transparent;word-break:break-all;} code.copy:hover{border-color:var(--brand);} code.copied{color:var(--ok);}
  ol.steps{margin:0;padding-left:20px;} ol.steps li{margin:0 0 9px;font-size:14px;} ol.steps b{color:var(--ink);}
  .note{font-size:13px;color:var(--muted);border-left:3px solid var(--line);padding:2px 0 2px 12px;margin:14px 0;} .note b{color:var(--ink);}
  .pick{display:inline-block;font-weight:700;border-radius:5px;padding:0 7px;font-size:12px;} .pick.on{background:var(--ok-bg);color:var(--ok);} .pick.off{background:var(--off-bg);color:var(--off);}
  footer{color:var(--muted);font-size:11.5px;margin-top:26px;text-align:center;}
  .toast{position:fixed;bottom:20px;left:50%;transform:translateX(-50%);background:var(--ink);color:var(--bg);padding:7px 14px;border-radius:7px;font-size:12.5px;opacity:0;transition:opacity .2s;pointer-events:none;}
  .toast.show{opacity:1;}
`;

const COPY_JS = /* js */ `
  function toast(m){var t=document.getElementById('toast');t.textContent=m;t.classList.add('show');clearTimeout(t._h);t._h=setTimeout(function(){t.classList.remove('show');},1100);}
  document.addEventListener('click',function(e){var c=e.target.closest('code.copy');if(!c)return;
    navigator.clipboard.writeText(c.getAttribute('data-v')).then(function(){c.classList.add('copied');toast('Copied');setTimeout(function(){c.classList.remove('copied');},700);}).catch(function(){toast('Copy failed');});});
`;

const shell = (title: string, body: string, buildId: string) => /* html */ `<!doctype html>
<html lang="en"><head><meta charset="utf-8"/><meta name="viewport" content="width=device-width, initial-scale=1"/>
<title>${esc(title)}</title><style>${CSS}</style></head><body>
<div class="wrap">${body}
<footer>Docs · <a href="/home" class="back">/home</a> · build <code>${esc(buildId)}</code></footer>
</div><div class="toast" id="toast"></div><script>${COPY_JS}</script></body></html>`;

// ---------------------------------------------------------------- index ------
export function renderDocsIndex(cfg: DocsConfig): string {
  const body = /* html */ `
  <div class="top"><h1>📘 Documentation</h1><div class="grow"></div><a class="back" href="/home">← live dashboard</a></div>
  <p class="intro">How provisioning works, and the four ways to connect Okta to this SCIM server. Open a method for its runbook.</p>

  <h2>How it works</h2>
  <div class="card2">
    <ol class="flow">
      <li><b>Assign in Okta</b> <span>— add a user to the SCIM app under Assignments.</span></li>
      <li><b>Okta → Keycloak</b> <span>— Okta gets an OAuth 2.0 access token (JWT).</span></li>
      <li><b>Okta → SCIM</b> <span>— <code>POST /scim/v2/Users</code> with the Bearer token.</span></li>
      <li><b>Stored &amp; shown</b> <span>— this server validates the JWT, persists the user, and it appears on <a href="/home">/home</a>.</span></li>
    </ol>
  </div>

  <h2>Methods</h2>
  <div class="cards">
    <a class="card" href="/docs/saml">
      <span class="tag priv">private</span>
      <div class="nm">SAML app + SCIM</div>
      <div class="wt">Custom SAML app as the shell; SCIM auth via OAuth 2.0 Client Credentials.</div>
      <div class="mini"><span class="g">Why:</span> fastest private path, dynamic tokens · <span class="r">Avoid:</span> no public catalog</div>
      <div class="open">Open runbook →</div>
    </a>
    <a class="card" href="/docs/swa">
      <span class="tag priv">private</span>
      <div class="nm">SWA app + SCIM</div>
      <div class="wt">Same as SAML but a Secure Web Authentication app is the shell.</div>
      <div class="mini"><span class="g">Why:</span> alternative shell · <span class="r">Avoid:</span> if SAML already works</div>
      <div class="open">Open runbook →</div>
    </a>
    <a class="card" href="/docs/oin">
      <span class="tag pub">public</span>
      <div class="nm">OIN (Integration Network)</div>
      <div class="wt">Submit to the public catalog; any Okta org can add it. Full Auth-Code + rotation.</div>
      <div class="mini"><span class="g">Why:</span> distribute to many customers · <span class="r">Avoid:</span> public + review overhead</div>
      <div class="open">Open runbook →</div>
    </a>
    <a class="card" href="/docs/private">
      <span class="tag priv">private</span>
      <div class="nm">Private SCIM test app</div>
      <div class="wt">Okta's "Add a private SCIM integration" — quick, but static-token auth only.</div>
      <div class="mini"><span class="g">Why:</span> quickest to test · <span class="r">Avoid:</span> no token rotation</div>
      <div class="open">Open runbook →</div>
    </a>
  </div>`;
  return shell('Documentation — SCIM provisioning', body, cfg.buildId);
}

// ------------------------------------------------------------ method pages ---
type Method = 'saml' | 'swa' | 'oin' | 'private';
export const METHOD_SLUGS: Method[] = ['saml', 'swa', 'oin', 'private'];

export function renderMethodPage(method: Method, cfg: DocsConfig): string {
  const provisioningInputs = /* html */ `
    <div class="kv">
      <span class="k">SCIM base URL</span><span>${val(cfg.scimBase)}</span>
      <span class="k">Unique identifier</span><span>${val('userName')}</span>
      <span class="k">Auth mode</span><span>OAuth 2.0 — Client Credentials</span>
      <span class="k">Token endpoint</span><span>${val(cfg.tokenEndpoint)}</span>
      <span class="k">Client ID</span><span>${val(cfg.clientId)}</span>
      <span class="k">Client secret</span><span>${val(cfg.clientSecret)}</span>
      <span class="k">Scope</span><span>${val(cfg.scope)}</span>
    </div>`;

  const M: Record<Method, { title: string; tag: string; what: string; body: string }> = {
    saml: {
      title: 'SAML app + SCIM',
      tag: 'private',
      what: 'Create a custom SAML 2.0 app in your own Okta org purely as a shell, enable SCIM provisioning on it, and authenticate to this server with the OAuth 2.0 Client Credentials grant. The SAML login side is never used.',
      body: /* html */ `
        <h2>Functions &amp; capabilities</h2>
        <ul class="list why">
          <li><b>Full SCIM lifecycle</b> — create, update, deactivate users; group + membership sync</li>
          <li><b>OAuth 2.0 Client Credentials</b> — Okta fetches short-lived JWTs from Keycloak automatically</li>
          <li><b>Private</b> — exists only in your org; nothing published</li>
          <li><b>JWT-secured</b> — every call verified against Keycloak JWKS (signature + issuer + scope + exp)</li>
        </ul>
        <h2>Why use it</h2>
        <ul class="list why">
          <li>Fastest private path, no Okta review</li>
          <li>SAML app <b>reliably exposes</b> the "Enable SCIM provisioning" toggle</li>
          <li>Client Credentials = dynamic tokens, no manual rotation</li>
        </ul>
        <h2>When to avoid it</h2>
        <ul class="list avoid">
          <li>You need <b>public distribution</b> to many Okta customers → use OIN</li>
          <li>You need <b>Authorization Code + refresh-token rotation</b> → OIN only</li>
          <li>The SAML fields are dummy clutter (unavoidable — Okta requires a sign-on method)</li>
        </ul>
        <h2>Inputs (real values — click to copy)</h2>
        <h3>SAML shell (placeholders — never used)</h3>
        <div class="kv">
          <span class="k">Single sign-on URL</span><span>${val('https://hash8-auth.example.com/acs')}</span>
          <span class="k">Audience URI</span><span>${val('https://hash8-auth.example.com')}</span>
        </div>
        <h3>SCIM provisioning (the real config)</h3>
        ${provisioningInputs}
        <h2>Runbook</h2>
        <ol class="steps">
          <li>Applications → <b>Create App Integration → SAML 2.0</b>.</li>
          <li>Name it, e.g. <code>Hash8 SCIM (private)</code>.</li>
          <li>Configure SAML: paste the two placeholder URLs above, tick <b>"Use this for Recipient URL and Destination URL"</b>.</li>
          <li>Feedback → <b>"I'm an Okta customer adding an internal app"</b> → Finish.</li>
          <li>General → App Settings → Edit → <b>☑ Enable SCIM provisioning</b> → Save.</li>
          <li>Provisioning → Integration → Edit → paste the SCIM values above → <b>Test Connector Configuration</b> → Save.</li>
          <li>Provisioning → To App → Edit → enable <span class="pick on">Create</span> <span class="pick on">Update</span> <span class="pick on">Deactivate</span>.</li>
          <li>Assignments → Assign a user → watch <a href="/home">/home</a>.</li>
        </ol>`,
    },
    swa: {
      title: 'SWA app + SCIM',
      tag: 'private',
      what: 'Identical to the SAML method, except the shell is a Secure Web Authentication (SWA) app. SWA is Okta\'s password-vaulting sign-on; like SAML, its login side is unused here — it just carries the SCIM switch.',
      body: /* html */ `
        <h2>Functions &amp; capabilities</h2>
        <ul class="list why">
          <li><b>Same SCIM lifecycle</b> as the SAML method (create / update / deactivate / groups)</li>
          <li><b>OAuth 2.0 Client Credentials</b> auth to this server</li>
          <li><b>Private</b> to your org</li>
        </ul>
        <h2>Why use it</h2>
        <ul class="list why">
          <li>An alternative shell if you'd rather not create a SAML app</li>
          <li>Also exposes the "Enable SCIM provisioning" toggle (SAML <b>or</b> SWA are the supported types)</li>
        </ul>
        <h2>When to avoid it</h2>
        <ul class="list avoid">
          <li>If the SAML method already works — there's no functional gain</li>
          <li>Same limits as SAML: no public catalog, no Auth-Code + rotation</li>
          <li><b>OIDC is not supported</b> for custom-app SCIM (per Okta docs) — neither SWA nor SAML has that issue</li>
        </ul>
        <h2>Inputs (real values — click to copy)</h2>
        <h3>SWA shell (placeholder — unused)</h3>
        <div class="kv"><span class="k">Sign-in URL</span><span>${val('https://hash8-auth.example.com/login')}</span></div>
        <h3>SCIM provisioning (the real config)</h3>
        ${provisioningInputs}
        <h2>Runbook</h2>
        <ol class="steps">
          <li>Applications → <b>Create App Integration → SWA</b> (Secure Web Authentication).</li>
          <li>Enter the placeholder sign-in URL above; finish creating the app.</li>
          <li>General → App Settings → Edit → <b>☑ Enable SCIM provisioning</b> → Save.</li>
          <li>Provisioning → Integration → Edit → paste the SCIM values above → Test → Save.</li>
          <li>Provisioning → To App → enable Create / Update / Deactivate.</li>
          <li>Assignments → Assign a user → watch <a href="/home">/home</a>.</li>
        </ol>`,
    },
    oin: {
      title: 'OIN — Okta Integration Network',
      tag: 'public',
      what: 'Submit the integration to Okta\'s public catalog using the OIN Wizard (from an Integrator Free Plan org). Once published, ANY Okta customer can add it in one click, and it unlocks the full OAuth 2.0 Authorization Code grant with refresh-token rotation.',
      body: /* html */ `
        <h2>Functions &amp; capabilities</h2>
        <ul class="list why">
          <li><b>Public distribution</b> — listed in the catalog, one-click add for every Okta org</li>
          <li><b>OAuth 2.0 Authorization Code + refresh-token rotation</b> (not available to private apps)</li>
          <li><b>Per-tenant Base URL variables</b> — each customer supplies their own subdomain</li>
          <li><b>Catalog categories</b> (Lifecycle Management, etc.) for discovery</li>
        </ul>
        <h2>Why use it</h2>
        <ul class="list why">
          <li>You want to sell/distribute this to many Okta customers</li>
          <li>You need the browser consent + refresh-token flow, not a static/CC token</li>
          <li>You want customers to self-serve without manual setup</li>
        </ul>
        <h2>When to avoid it</h2>
        <ul class="list avoid">
          <li>Internal use or a single customer — OIN is <b>public by definition</b>, no private listing</li>
          <li>Submission + Okta <b>review</b> overhead (Runscope tests, QA, wait time)</li>
          <li>Requires a separate <b>Integrator Free Plan</b> org; the OIN Wizard runs only there</li>
        </ul>
        <h2>Inputs (OIN Wizard)</h2>
        <div class="kv">
          <span class="k">Authentication mode</span><span>OAuth 2.0 (Authorization Code)</span>
          <span class="k">Token endpoint</span><span>${val(cfg.tokenEndpoint)}</span>
          <span class="k">Authorize endpoint</span><span>${val(cfg.authEndpoint)}</span>
          <span class="k">Client ID</span><span>${val(cfg.clientId)}</span>
          <span class="k">Client secret</span><span>${val(cfg.clientSecret)}</span>
          <span class="k">Scope</span><span>${val(cfg.scope)}</span>
          <span class="k">Base URL</span><span>${val(cfg.scimBase)} (or per-tenant, e.g. <code>https://\${app.subdomain}.example.com/scim/v2</code>)</span>
        </div>
        <h2>Runbook</h2>
        <ol class="steps">
          <li>In an <b>Integrator Free Plan</b> org: Applications → <b>Your OIN Integrations → Build</b> (OIN Wizard).</li>
          <li>Set OIN catalog properties (display name, logo, description, categories — e.g. Lifecycle Management).</li>
          <li><b>Authentication settings</b> → OAuth 2 (Authorization Code) → paste the endpoints + client above.</li>
          <li><b>SCIM properties</b> → Base URL + supported operations (Create/Update/Deactivate, Groups).</li>
          <li>Provide a config-guide URL + a test account for Okta's reviewers.</li>
          <li>Run the required <b>Runscope</b> spec + CRUD tests, submit the result links.</li>
          <li>Submit for review → Okta publishes it to the catalog.</li>
        </ol>
        <p class="note"><b>Note:</b> for a single customer like Sunbelt via direct setup, the SAML method is simpler; OIN only pays off for broad distribution.</p>`,
    },
    private: {
      title: 'Private SCIM test app',
      tag: 'private',
      what: 'Okta\'s "Add a private SCIM integration" path — create a SCIM 2.0 test app from the catalog in your org for quick testing. Simple, but its OAuth option is a single static token (no Client Credentials / Authorization Code with refresh).',
      body: /* html */ `
        <h2>Functions &amp; capabilities</h2>
        <ul class="list why">
          <li><b>SCIM lifecycle</b> — create / update / deactivate / groups</li>
          <li><b>Fastest to stand up</b> — no SAML/SWA shell configuration</li>
          <li>Auth modes: <b>Basic</b>, <b>Header (bearer)</b>, or a <b>static OAuth token</b></li>
        </ul>
        <h2>Why use it</h2>
        <ul class="list why">
          <li>Quickest way to smoke-test a SCIM server against Okta</li>
          <li>Good for a throwaway/manual test where token lifetime doesn't matter</li>
        </ul>
        <h2>When to avoid it</h2>
        <ul class="list avoid">
          <li><b>Static token only</b> — it expires and you must paste a new one by hand (no auto-refresh)</li>
          <li>No OAuth 2.0 <b>Client Credentials</b> / <b>Authorization Code</b> with rotation (those need SAML/SWA or OIN)</li>
          <li>Not distributable</li>
        </ul>
        <h2>Inputs (real values — click to copy)</h2>
        <div class="kv">
          <span class="k">SCIM base URL</span><span>${val(cfg.scimBase)}</span>
          <span class="k">Unique identifier</span><span>${val('userName')}</span>
          <span class="k">Auth mode</span><span>HTTP Header (Bearer token)</span>
          <span class="k">Bearer token</span><span class="k">a Keycloak access token — get one with:</span>
        </div>
        <pre class="pl" style="background:var(--chip);color:var(--chip-ink);padding:10px 12px;border-radius:8px;font-size:12px;overflow:auto;">curl -X POST ${esc(cfg.tokenEndpoint)} \\
  -d grant_type=client_credentials \\
  -d client_id=${esc(cfg.clientId)} \\
  -d client_secret=${esc(cfg.clientSecret)} \\
  -d scope=${esc(cfg.scope)}</pre>
        <h2>Runbook</h2>
        <ol class="steps">
          <li>Applications → Browse App Catalog → <b>"SCIM 2.0 Test App (Header Auth)"</b> → Add.</li>
          <li>Provisioning → <b>Configure API Integration → Enable</b>.</li>
          <li>Paste the <b>Base URL</b> above and the <b>Bearer token</b> from the curl command → Test → Save.</li>
          <li>Enable To App: Create / Update / Deactivate.</li>
          <li>Assignments → Assign a user → watch <a href="/home">/home</a>.</li>
        </ol>
        <p class="note"><b>Token expiry caveat:</b> the token above lives ~60s in this demo, so this static-token method will 401 quickly — that's exactly why the <a href="/docs/saml">SAML method</a> (Client Credentials, auto-refreshed) is the recommended private path.</p>`,
    },
  };

  const m = M[method];
  const tagCls = m.tag === 'public' ? 'pub' : 'priv';
  const body = /* html */ `
    <div class="top"><h1>${esc(m.title)}</h1><div class="grow"></div><a class="back" href="/docs">← all methods</a></div>
    <p class="intro"><span class="tag ${tagCls}" style="display:inline-block;font-size:10.5px;font-weight:700;padding:2px 8px;border-radius:999px;">${esc(m.tag)}</span> &nbsp;${esc(m.what)}</p>
    ${m.body}`;
  return shell(`${m.title} — runbook`, body, cfg.buildId);
}
