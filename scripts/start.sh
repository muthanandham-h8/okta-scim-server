#!/usr/bin/env bash
#
# One-command setup + start for the SCIM demo stack (macOS / Linux).
# Shell alternative to `npm run demo:start` (scripts/start.mjs); the Node script
# stays the cross-platform default and is what Windows should use.
#
# Usage:
#   ./scripts/start.sh                 # preflight, install, and bring the stack up
#   SKIP_NGROK=1 ./scripts/start.sh    # local-only, no public tunnel
# Stop with: ./scripts/stop.sh
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
LOGS="$ROOT/logs"
PIDS="$ROOT/.demo-pids.json"
SKIP_NGROK="${SKIP_NGROK:-}"

have() { command -v "$1" >/dev/null 2>&1; }

# ---- OS-specific install hints ---------------------------------------------
case "$(uname -s)" in
  Darwin) DOCKER_HINT="Install Docker Desktop (https://www.docker.com/products/docker-desktop) or 'brew install --cask docker', then start it."
          NGROK_HINT="Install ngrok: 'brew install ngrok/ngrok/ngrok' (or https://ngrok.com/download)." ;;
  *)      DOCKER_HINT="Install Docker Engine + compose plugin (https://docs.docker.com/engine/install/), e.g. 'sudo apt-get install docker.io docker-compose-plugin'."
          NGROK_HINT="Install ngrok: 'sudo snap install ngrok' (or https://ngrok.com/download)." ;;
esac

# ---- pid helpers (same JSON shape as scripts/stop.mjs / stop.sh) ------------
write_pids() { printf '{\n  "app": %s,\n  "proxy": %s,\n  "ngrok": %s\n}\n' "${1:-null}" "${2:-null}" "${3:-null}" > "$PIDS"; }
read_pid()   { [ -f "$PIDS" ] && grep -oE "\"$1\": *[0-9]+" "$PIDS" | grep -oE '[0-9]+' || true; }
kill_pid()   { [ -n "${1:-}" ] && kill "$1" 2>/dev/null || true; }

free_port() {
  local port="$1" pids=""
  if have lsof; then pids="$(lsof -ti "tcp:$port" -sTCP:LISTEN 2>/dev/null || true)"
  elif have fuser; then pids="$(fuser "$port/tcp" 2>/dev/null || true)"; fi
  for p in $pids; do kill "$p" 2>/dev/null || true; done
}

# ---- 0) preflight ----------------------------------------------------------
problems=()
if ! have docker; then problems+=("Docker is not installed.
     Fix: $DOCKER_HINT")
elif ! docker info >/dev/null 2>&1; then problems+=("Docker is installed but not running.
     Fix: start Docker Desktop / the docker daemon, then re-run.")
fi

if [ -z "$SKIP_NGROK" ]; then
  if ! have ngrok; then
    problems+=("ngrok is not installed.
     Fix: $NGROK_HINT
     (or run with SKIP_NGROK=1 to start local-only, no public URL)")
  else
    cfg="$(ngrok config check 2>/dev/null | grep -oE 'at .*' | sed 's/^at //' || true)"
    if [ -z "$cfg" ] || ! grep -q 'authtoken:' "$cfg" 2>/dev/null; then
      problems+=("ngrok is installed but has no authtoken configured.
     Fix: get our team's ngrok authtoken (that account owns the reserved domain), then run:
          ngrok config add-authtoken <TOKEN>
     Then re-run.  (or SKIP_NGROK=1 for local-only)")
    fi
  fi
fi

if [ "${#problems[@]}" -gt 0 ]; then
  echo ""
  echo "✖ Setup can't continue until these are fixed:"
  echo ""
  i=1; for p in "${problems[@]}"; do echo "  $i. $p"; echo ""; i=$((i+1)); done
  echo "Fix the above, then run the command again."
  exit 1
fi

mkdir -p "$LOGS"

# ---- 1) .env ---------------------------------------------------------------
if [ ! -f "$ROOT/.env" ]; then
  [ -f "$ROOT/.env.example" ] || { echo "✖ No .env and no .env.example to copy from."; exit 1; }
  cp "$ROOT/.env.example" "$ROOT/.env"
  echo "• created .env from .env.example"
fi

# ---- 2) deps ---------------------------------------------------------------
if [ ! -d "$ROOT/node_modules" ]; then
  echo "• node_modules missing - installing dependencies"
  npm install
fi

# ---- single source of truth: domain ----------------------------------------
PUBLIC_BASE_URL="$(grep -E '^PUBLIC_BASE_URL=' "$ROOT/.env" | head -1 | cut -d= -f2- | tr -d '"' || true)"
PUBLIC_BASE_URL="${PUBLIC_BASE_URL:-http://localhost:8080}"
PUBLIC_HOST="$(printf '%s' "$PUBLIC_BASE_URL" | sed -E 's#^https?://##; s#/.*$##')"
export PUBLIC_BASE_URL PUBLIC_HOST     # docker compose (KC_HOSTNAME) + edge-proxy
WANT_TUNNEL=""
if [ -z "$SKIP_NGROK" ] && [[ "$PUBLIC_BASE_URL" == https://* ]] && [[ "$PUBLIC_HOST" != *localhost* ]] && [[ "$PUBLIC_HOST" != *127.0.0.1* ]]; then
  WANT_TUNNEL=1
fi

# stop a previous run + free ports (avoids double-bind / Prisma engine lock)
for k in app proxy ngrok; do kill_pid "$(read_pid "$k")"; done
free_port 3000; free_port 8088
sleep 1

echo ""
echo "▶ Starting SCIM demo stack"
echo ""

# ---- 3) bring it up --------------------------------------------------------
echo "1/5 Docker (Postgres + Keycloak)"
docker compose up -d

printf "2/5 Waiting for Postgres"
for _ in $(seq 1 40); do
  if docker exec okta-scim-postgres pg_isready -U scim -d okta_scim >/dev/null 2>&1; then echo " ready"; break; fi
  printf "."; sleep 1
done

echo "3/5 Prisma (generate + migrate deploy)"
npx prisma generate
npx prisma migrate deploy

echo "4/5 Building app"
npm run build

echo "5/5 Starting services"
nohup node "$ROOT/dist/main.js" >> "$LOGS/app.log" 2>&1 & APP=$!
nohup node "$ROOT/tools/edge-proxy.js" >> "$LOGS/edge-proxy.log" 2>&1 & PROXY=$!
NGROK=null
if [ -n "$WANT_TUNNEL" ]; then
  CFG="$(ngrok config check 2>/dev/null | grep -oE 'at .*' | sed 's/^at //' || true)"
  if [ -n "$CFG" ]; then
    nohup ngrok http 8088 --domain "$PUBLIC_HOST" --config "$CFG" --log stdout >> "$LOGS/ngrok.log" 2>&1 & NGROK=$!
  else
    nohup ngrok http 8088 --domain "$PUBLIC_HOST" --log stdout >> "$LOGS/ngrok.log" 2>&1 & NGROK=$!
  fi
  echo "  ngrok tunnel -> https://$PUBLIC_HOST"
else
  echo "  (skipping ngrok tunnel - SKIP_NGROK set or PUBLIC_BASE_URL is local)"
fi

write_pids "$APP" "$PROXY" "$NGROK"

echo ""
echo "✅ Stack is up."
echo "   Demo dashboard : http://localhost:3000/demo"
[ -n "$WANT_TUNNEL" ] && echo "   Public demo    : $PUBLIC_BASE_URL/demo"
echo "   ngrok inspector: http://localhost:4040"
echo "   Logs           : $LOGS"
echo "   Stop with      : ./scripts/stop.sh"
echo ""
