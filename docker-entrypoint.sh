#!/bin/sh
set -e

# Only the app service should apply database migrations. The edge-proxy reuses
# this image but overrides the command and leaves RUN_MIGRATIONS unset.
if [ "$RUN_MIGRATIONS" = "1" ]; then
  echo "[entrypoint] Applying database migrations (prisma migrate deploy)..."
  npx prisma migrate deploy
  echo "[entrypoint] Migrations up to date."
fi

exec "$@"
