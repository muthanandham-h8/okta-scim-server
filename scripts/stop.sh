#!/usr/bin/env bash
#
# Stop the SCIM demo stack (macOS / Linux). Shell alternative to
# `npm run demo:stop` (scripts/stop.mjs).
#
# Usage:
#   ./scripts/stop.sh          # stop app/proxy/ngrok + containers, keep data
#   ./scripts/stop.sh --down   # also remove containers (keeps the volume)
#   ./scripts/stop.sh --wipe   # remove containers AND the database volume
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
PIDS="$ROOT/.demo-pids.json"

read_pid() { [ -f "$PIDS" ] && grep -oE "\"$1\": *[0-9]+" "$PIDS" | grep -oE '[0-9]+' || true; }
stop_one() {
  local name="$1" pid; pid="$(read_pid "$name")"
  if [ -n "$pid" ] && kill "$pid" 2>/dev/null; then echo "  stopped $name (pid $pid)"; else echo "  $name not running"; fi
}

echo "■ Stopping SCIM demo stack"
echo ""
if [ -f "$PIDS" ]; then
  stop_one app; stop_one proxy; stop_one ngrok
  rm -f "$PIDS"
else
  echo "  no .demo-pids.json — services may not be running"
fi

case "${1:-}" in
  --wipe) DOCKER=(compose down -v) ;;
  --down) DOCKER=(compose down) ;;
  *)      DOCKER=(compose stop) ;;
esac
echo ""
echo "  docker ${DOCKER[*]}"
docker "${DOCKER[@]}" || true

echo ""
echo "✅ Stopped."
