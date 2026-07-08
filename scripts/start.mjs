#!/usr/bin/env node
/**
 * Cross-platform starter for the SCIM demo stack (Windows / macOS / Linux).
 *
 *   Postgres + Keycloak (docker) -> app (:3000) -> edge-proxy (:8088) -> ngrok
 *
 * Foreground steps (docker, prisma, build) run to completion; the three
 * long-running services are spawned detached with logs in ./logs and their PIDs
 * saved to .demo-pids.json so `npm run demo:stop` can shut them down.
 *
 * Usage:  node scripts/start.mjs
 */
import { spawn, spawnSync, execSync } from 'node:child_process';
import { existsSync, mkdirSync, openSync, writeFileSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const logsDir = join(root, 'logs');
const pidFile = join(root, '.demo-pids.json');
const isWin = process.platform === 'win32';

if (!existsSync(logsDir)) mkdirSync(logsDir);

const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);

// Foreground command; aborts the script on failure. Uses a single shell string
// (not args+shell:true) to avoid Node's DEP0190 warning.
function run(cmd, args) {
  const line = `${cmd} ${args.join(' ')}`;
  console.log(`  $ ${line}`);
  const r = spawnSync(line, { cwd: root, stdio: 'inherit', shell: true });
  if (r.status !== 0) { console.error(`✖ "${line}" failed`); process.exit(1); }
}

// Capture stdout of a quick command (returns '' on failure).
function capture(cmd) {
  try { return execSync(cmd, { cwd: root, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(); }
  catch { return ''; }
}

// Detached background service; returns its PID.
function startService(name, bin, args) {
  const out = openSync(join(logsDir, `${name}.log`), 'a');
  const child = spawn(bin, args, { cwd: root, detached: true, stdio: ['ignore', out, out] });
  child.unref();
  return child.pid;
}

function killPid(pid) {
  if (!pid) return;
  try { process.kill(pid); } catch { /* already gone */ }
}

// Stop anything from a previous run so we never double-bind ports.
if (existsSync(pidFile)) {
  try {
    const prev = JSON.parse(readFileSync(pidFile, 'utf8'));
    Object.values(prev).forEach(killPid);
    sleep(500);
  } catch { /* ignore */ }
}

console.log('▶ Starting SCIM demo stack\n');

// 1) Postgres + Keycloak
console.log('1/5 Docker (Postgres + Keycloak)');
run('docker', ['compose', 'up', '-d']);

// 2) wait for Postgres to accept connections
process.stdout.write('2/5 Waiting for Postgres');
let dbReady = false;
for (let i = 0; i < 40; i++) {
  const r = spawnSync('docker exec okta-scim-postgres pg_isready -U scim -d okta_scim',
    { stdio: 'ignore', shell: true });
  if (r.status === 0) { dbReady = true; break; }
  process.stdout.write('.');
  sleep(1000);
}
console.log(dbReady ? ' ready' : ' timed out (continuing anyway)');

// 3) Prisma client + migrations
console.log('3/5 Prisma (generate + migrate deploy)');
run('npx', ['prisma', 'generate']);
run('npx', ['prisma', 'migrate', 'deploy']);

// 4) Build
console.log('4/5 Building app');
run('npm', ['run', 'build']);

// 5) Background services
console.log('5/5 Starting services');
const app = startService('app', process.execPath, [join(root, 'dist', 'main.js')]);
const proxy = startService('edge-proxy', process.execPath, [join(root, 'tools', 'edge-proxy.js')]);

let ngrok = null;
const ngrokBin = capture(isWin ? 'where ngrok' : 'which ngrok').split(/\r?\n/)[0].trim();
if (ngrokBin) {
  const args = ['start', 'edge', '--log', 'stdout'];
  const check = capture('ngrok config check');           // locate the default config (holds the authtoken)
  const m = check.match(/at (.+)$/m);
  if (m) args.push('--config', m[1].trim());
  args.push('--config', join(root, 'ngrok.yml'));
  ngrok = startService('ngrok', ngrokBin, args);
} else {
  console.log('  (ngrok not found on PATH — skipping public tunnel; local URLs still work)');
}

writeFileSync(pidFile, JSON.stringify({ app, proxy, ngrok }, null, 2));

// Public base URL (best-effort read of .env for the printout).
let publicBase = '';
try {
  const env = readFileSync(join(root, '.env'), 'utf8');
  const m = env.match(/^PUBLIC_BASE_URL="?([^"\n]+)"?/m);
  if (m) publicBase = m[1].trim();
} catch { /* ignore */ }

console.log('\n✅ Stack is up.');
console.log(`   Demo dashboard : http://localhost:3000/demo`);
if (publicBase) console.log(`   Public demo    : ${publicBase}/demo`);
console.log(`   ngrok inspector: http://localhost:4040`);
console.log(`   Logs           : ${logsDir}`);
console.log(`   Stop with      : npm run demo:stop\n`);
