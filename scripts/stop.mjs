#!/usr/bin/env node
/**
 * Cross-platform stopper for the SCIM demo stack (Windows / macOS / Linux).
 *
 * Kills the app, edge-proxy and ngrok started by scripts/start.mjs (PIDs in
 * .demo-pids.json), then stops the Docker containers (data is preserved).
 *
 * Usage:
 *   node scripts/stop.mjs          # stop services + containers, keep data
 *   node scripts/stop.mjs --down   # also remove containers (keeps the volume)
 *   node scripts/stop.mjs --wipe   # remove containers AND the database volume
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pidFile = join(root, '.demo-pids.json');
const arg = process.argv[2];

function killPid(name, pid) {
  if (!pid) return;
  try { process.kill(pid); console.log(`  stopped ${name} (pid ${pid})`); }
  catch { console.log(`  ${name} (pid ${pid}) not running`); }
}

console.log('■ Stopping SCIM demo stack\n');

if (existsSync(pidFile)) {
  try {
    const pids = JSON.parse(readFileSync(pidFile, 'utf8'));
    killPid('app', pids.app);
    killPid('edge-proxy', pids.proxy);
    killPid('ngrok', pids.ngrok);
  } catch { console.log('  (could not read .demo-pids.json)'); }
  rmSync(pidFile, { force: true });
} else {
  console.log('  no .demo-pids.json — services may not be running');
}

const dockerCmd =
  arg === '--wipe' ? 'docker compose down -v' :
  arg === '--down' ? 'docker compose down' :
  'docker compose stop';
console.log(`\n  ${dockerCmd}`);
spawnSync(dockerCmd, { cwd: root, stdio: 'inherit', shell: true });

console.log('\n✅ Stopped.');
