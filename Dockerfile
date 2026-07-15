# Production image for the SCIM resource server (and, reused, the edge-proxy).
#
# Multi-arch: builds cleanly on linux/amd64 AND linux/arm64 (Oracle Cloud
# Ampere A1). Debian slim is used rather than Alpine so Prisma's query engine
# gets the OpenSSL it expects without musl workarounds.
#
# The same image runs two of the compose services:
#   - app        -> ENTRYPOINT runs `prisma migrate deploy` then `node dist/main.js`
#   - edge-proxy -> command overridden to `node tools/edge-proxy.js` (no migrate)

FROM node:20-bookworm-slim

WORKDIR /app

# OpenSSL + CA certs are required by the Prisma engine and for TLS to Keycloak.
RUN apt-get update \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

# Install dependencies first for better layer caching.
COPY package*.json ./
RUN npm ci

# Build: generate the Prisma client for THIS platform, then compile Nest.
COPY . .
RUN npx prisma generate && npm run build

ENV NODE_ENV=production
EXPOSE 3000 8088

COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["node", "dist/main.js"]
