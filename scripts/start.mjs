#!/usr/bin/env node
/**
 * One-command cross-platform setup + start for the SCIM demo stack
 * (Windows / macOS / Linux). Safe to run on a fresh clone.
 *
 * It will:
 *   0. Preflight - check Docker (installed + running) and ngrok (installed +
 *      authenticated). If anything is missing it prints OS-specific fix steps
 *      and stops so you can configure and re-run.
 *   1. Create .env from .env.example if missing.
 *   2. npm install if node_modules is missing.
 *   3. Bring up Postgres + Keycloak (docker), run Prisma, build, then start the
 *      app (:3000), edge-proxy (:8088) and ngrok - all on the single domain
 *      defined in .env (PUBLIC_BASE_URL).
 *
 * Usage:  npm run setup   (alias: npm run demo:start)
 *         SKIP_NGROK=1 npm run setup   -> local-only, no public tunnel
 */
import { spawn, spawnSync, execSync } from 'node:child_process';
import {
  existsSync, mkdirSync, openSync, writeFileSync, readFileSync, copyFileSync,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logsDir = join(root, 'logs');
const pidFile = join(root, '.demo-pids.json');
const os = process.platform;            // 'win32' | 'darwin' | 'linux'
const isWin = os === 'win32';
const skipNgrok = !!process.env.SKIP_NGROK;

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

function capture(cmd) {
  try { return execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return ''; }
}
const have = (cmd) => capture(isWin ? `where ${cmd}` : `command -v ${cmd}`) !== '';

function run(cmd, args) {
  const line = `${cmd} ${args.join(' ')}`;
  console.log(`  $ ${line}`);
  const r = spawnSync(line, { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) { console.error(`✖ "${line}" failed`); process.exit(1); }
}

function startService(name, bin, args) {
  const out = openSync(join(logsDir, `${name}.log`), 'a');
  const child = spawn(bin, args, { cwd: root, detached: true, stdio: ['ignore', out, out] });
  child.unref();
  return child.pid;
}
const killPid = (pid) => { if (pid) { try { process.kill(pid); } catch { /* gone */ } } };

// Best-effort, cross-OS: free a TCP port by killing whatever LISTENs on it. This
// prevents a stray app instance from holding the Prisma engine DLL (Windows
// EPERM) or double-binding a port on the next run.
function pidsOnPort(port) {
  if (isWin) {
    return [...new Set(
      capture(`netstat -ano | findstr :${port}`)
        .split(/\r?\n/).filter((l) => /LISTENING/.test(l))
        .map((l) => l.trim().split(/\s+/).pop()).filter(Boolean),
    )];
  }
  return capture(`lsof -ti tcp:${port} -sTCP:LISTEN`).split(/\r?\n/).map((s) => s.trim()).filter(Boolean);
}
const freePorts = (ports) => ports.forEach((p) => pidsOnPort(p).forEach((pid) => killPid(Number(pid))));

// ---------------------------------------------------------------- 0) preflight
const HINT = {
  docker: {
    win32: 'Install Docker Desktop (https://www.docker.com/products/docker-desktop) and make sure it is running.',
    darwin: 'Install Docker Desktop (https://www.docker.com/products/docker-desktop) or `brew install --cask docker`, then start it.',
    linux: 'Install Docker Engine + compose plugin (https://docs.docker.com/engine/install/), e.g. `sudo apt-get install docker.io docker-compose-plugin`.',
  },
  ngrok: {
    win32: 'Install ngrok: `choco install ngrok`  (or download https://ngrok.com/download).',
    darwin: 'Install ngrok: `brew install ngrok/ngrok/ngrok`  (or https://ngrok.com/download).',
    linux: 'Install ngrok: `sudo snap install ngrok`  (or https://ngrok.com/download).',
  },
};

const problems = [];

if (!have('docker')) {
  problems.push(`Docker is not installed.\n     Fix: ${HINT.docker[os]}`);
} else if (spawnSync('docker info', { stdio: 'ignore', shell: true }).status !== 0) {
  problems.push('Docker is installed but not running.\n     Fix: start Docker Desktop / the docker daemon, then re-run.');
}

if (!skipNgrok) {
  if (!have('ngrok')) {
    problems.push(
      `ngrok is not installed.\n     Fix: ${HINT.ngrok[os]}\n` +
      '     (or run with SKIP_NGROK=1 to start local-only, no public URL)',
    );
  } else {
    // authenticated? the authtoken lives in ngrok's default config file.
    const m = capture('ngrok config check').match(/at (.+)$/m);
    let hasToken = false;
    if (m) { try { hasToken = /authtoken:/.test(readFileSync(m[1].trim(), 'utf8')); } catch { /* no file */ } }
    if (!hasToken) {
      problems.push(
        'ngrok is installed but has no authtoken configured.\n' +
        "     Fix: get our team's ngrok authtoken (that account owns the reserved\n" +
        '          domain), then run:  ngrok config add-authtoken <TOKEN>\n' +
        '     Then re-run this command.  (or SKIP_NGROK=1 for local-only)',
      );
    }
  }
}

if (problems.length) {
  console.error("\n✖ Setup can't continue until these are fixed:\n");
  problems.forEach((p, i) => console.error(`  ${i + 1}. ${p}\n`));
  console.error('Fix the above, then run the command again.\n');
  process.exit(1);
}

if (!existsSync(logsDir)) mkdirSync(logsDir);

// ---------------------------------------------------------------- 1) .env
const envPath = join(root, '.env');
if (!existsSync(envPath)) {
  const example = join(root, '.env.example');
  if (!existsSync(example)) { console.error('✖ No .env and no .env.example to copy from.'); process.exit(1); }
  copyFileSync(example, envPath);
  console.log('• created .env from .env.example');
}

// ---------------------------------------------------------------- 2) deps
if (!existsSync(join(root, 'node_modules'))) {
  console.log('• node_modules missing - installing dependencies');
  run('npm', ['install']);
}

// ------------------------------------------------ single source of truth: domain
// PUBLIC_BASE_URL in .env is THE place the domain is defined. Everything else
// derives from it: docker-compose (KC_HOSTNAME), edge-proxy (PUBLIC_HOST), ngrok
// (--domain). Change it in .env, re-run, and it propagates everywhere.
function loadEnv() {
  const out = {};
  try {
    for (const line of readFileSync(envPath, 'utf8').split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Za-z0-9_]+)\s*=\s*"?([^"\n]*)"?\s*$/);
      if (m) out[m[1]] = m[2];
    }
  } catch { /* optional */ }
  return out;
}
const dotenv = loadEnv();
const PUBLIC_BASE_URL = dotenv.PUBLIC_BASE_URL || process.env.PUBLIC_BASE_URL || 'http://localhost:8080';
const PUBLIC_HOST = PUBLIC_BASE_URL.replace(/^https?:\/\//, '').replace(/\/.*$/, '');
const wantTunnel = !skipNgrok && /^https:\/\//.test(PUBLIC_BASE_URL) && !/localhost|127\.0\.0\.1/.test(PUBLIC_HOST);
process.env.PUBLIC_BASE_URL = PUBLIC_BASE_URL;   // inherited by docker compose + child services
process.env.PUBLIC_HOST = PUBLIC_HOST;

// Stop anything from a previous run so we never double-bind ports or lock the
// Prisma engine DLL: kill tracked PIDs, then free the ports as a backstop.
if (existsSync(pidFile)) {
  try { Object.values(JSON.parse(readFileSync(pidFile, 'utf8'))).forEach(killPid); }
  catch { /* ignore */ }
}
freePorts([3000, 8088]);
sleep(600);

console.log('\n▶ Starting SCIM demo stack\n');

// 3a) Postgres + Keycloak
console.log('1/5 Docker (Postgres + Keycloak)');
run('docker', ['compose', 'up', '-d']);

// 3b) wait for Postgres
process.stdout.write('2/5 Waiting for Postgres');
let dbReady = false;
for (let i = 0; i < 40; i++) {
  if (spawnSync('docker exec okta-scim-postgres pg_isready -U scim -d okta_scim', { stdio: 'ignore', shell: true }).status === 0) {
    dbReady = true; break;
  }
  process.stdout.write('.');
  sleep(1000);
}
console.log(dbReady ? ' ready' : ' timed out (continuing anyway)');

// 3c) Prisma + build
console.log('3/5 Prisma (generate + migrate deploy)');
run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);
console.log('4/5 Building app');
run('npm', ['run', 'build']);

// 3d) background services
console.log('5/5 Starting services');
const app = startService('app', process.execPath, [join(root, 'dist', 'main.js')]);
const proxy = startService('edge-proxy', process.execPath, [join(root, 'tools', 'edge-proxy.js')]);

let ngrok = null;
if (wantTunnel) {
  const ngrokBin = capture(isWin ? 'where ngrok' : 'which ngrok').split(/\r?\n/)[0].trim();
  const args = ['http', '8088', '--domain', PUBLIC_HOST, '--log', 'stdout'];
  const m = capture('ngrok config check').match(/at (.+)$/m);   // default config holds the authtoken
  if (m) args.push('--config', m[1].trim());
  ngrok = startService('ngrok', ngrokBin, args);
  console.log(`  ngrok tunnel -> https://${PUBLIC_HOST}`);
} else {
  console.log('  (skipping ngrok tunnel - SKIP_NGROK set or PUBLIC_BASE_URL is local)');
}

writeFileSync(pidFile, JSON.stringify({ app, proxy, ngrok }, null, 2));

console.log('\n✅ Stack is up.');
console.log('   Demo dashboard : http://localhost:3000/demo');
if (wantTunnel) console.log(`   Public demo    : ${PUBLIC_BASE_URL}/demo`);
console.log('   ngrok inspector: http://localhost:4040');
console.log(`   Logs           : ${logsDir}`);
console.log('   Stop with      : npm run demo:stop\n');
