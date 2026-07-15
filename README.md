# SCIM 2.0 Server (Keycloak-secured)

A SCIM 2.0 provisioning server (NestJS + Prisma/PostgreSQL) that an identity
provider such as Okta can use to automatically create, update, deactivate, and
group users. Access tokens are **issued by Keycloak** (the authorization
server) and only **validated** here — this service issues nothing.

> Previously this repo bundled its own OAuth 2.0 authorization server. That was
> replaced by Keycloak: token issuance, clients, login, and refresh now live in
> Keycloak, and this service became a pure OAuth2 **resource server** that
> verifies Keycloak JWTs against its JWKS.

## Architecture

- **Keycloak** (`docker-compose.yml`, realm in `keycloak/realm-scim.json`) — the
  authorization server. Owns clients, users, login, and token issuance. The
  identity provider (Okta) is a *client* of Keycloak, not the token issuer.
- `src/auth` — `JwtAuthGuard`, which validates incoming `Bearer` JWTs against
  Keycloak's JWKS (signature + issuer + optional audience + required scope). No
  database lookup: the token's signature is the source of truth.
- `src/scim` — SCIM 2.0 resource server: `/scim/v2/Users`, `/scim/v2/Groups`,
  and discovery endpoints (`ServiceProviderConfig`, `ResourceTypes`,
  `Schemas`), protected by `JwtAuthGuard`.
- `src/demo` — presentation pages (`/home` dashboard, `/docs` runbooks).
- `tools/edge-proxy.js` — a small reverse proxy that serves this app and
  Keycloak under one public domain (for ngrok's single-URL free tier) and taps
  the traffic for the `/home` activity log.
- `prisma/schema.prisma` — Postgres models for SCIM users/groups only.

```
Okta (client) ──get token──▶ Keycloak (issuer) ──JWT──▶ Okta
Okta ──Bearer JWT──▶ /scim/v2/*  ──verify signature via JWKS──▶ Keycloak
```

## Quick start (one command)

Brings up Postgres + Keycloak (Docker), runs Prisma, builds, and starts the app,
edge-proxy, and an ngrok tunnel on the single public domain from `.env`:

```bash
npm run demo:start      # start everything   (alias: npm run setup)
npm run demo:stop       # stop everything
```

Prerequisites: **Docker** running, and **ngrok** installed + authenticated
(or run `SKIP_NGROK=1 npm run demo:start` for local-only). See the script header
in `scripts/start.mjs`.

<details>
<summary>Manual setup (without the helper script)</summary>

```bash
docker compose up -d                 # Postgres + Keycloak (auto-imports the realm)
npm install
npm run prisma:migrate               # or: npx prisma migrate deploy
npm run build && npm run start:prod  # or: npm run start:dev  (watch mode)
```
</details>

## UI pages

| Path | What |
|---|---|
| **`/home`** | Live dashboard — provisioned users + a clear Okta ⇄ Keycloak ⇄ SCIM activity log (request/response, headers, payloads). `/` and `/demo` redirect here. |
| **`/docs`** | Documentation — "How it works" + runbooks per method: `/docs/saml`, `/docs/swa`, `/docs/oin`, `/docs/private`. |
| **`/swagger`** | Interactive API docs (Swagger). Auth via **keycloak-jwt** (paste a JWT) or **keycloak-oauth2** (runs Keycloak's auth-code flow). |

## What the imported realm contains

| Thing | Value |
|---|---|
| Realm | `scim` |
| Client — demo/testing | `scim-client` / `w_ZeIPDTrGvDwE9sb0fWQPXV-AZqmU-7` |
| Client — dedicated for Okta | `okta-provisioning` / `7Qhq86B8mibREt7hoTcjBzSEO2NvMJlb` |
| Test user | `alice` / `alice` |
| Scope | `scim` (default client scope, appears in the token) |
| Access token lifespan | `60s` (set low so token re-fetches are visible in the demo log; raise `accessTokenLifespan` in the realm for real use) |
| Issuer | `http://localhost:8080/realms/scim` |

`okta-provisioning` is a separate confidential client (client-credentials
enabled) so Okta's access can be rotated/revoked independently of the demo
`scim-client`.

## Connecting Okta (private integration — recommended)

Create a **custom SAML app** in your Okta org purely as a shell, enable SCIM
provisioning, and authenticate with **OAuth 2.0 Client Credentials** against
Keycloak. Full step-by-step: open **`/docs/saml`**. Key values:

| Okta provisioning field | Value |
|---|---|
| SCIM connector base URL | `https://<this-service>/scim/v2` |
| Auth mode | OAuth 2.0 — Client Credentials |
| Token endpoint | `https://<keycloak>/realms/scim/protocol/openid-connect/token` |
| Client ID / Secret | `okta-provisioning` / (its secret) |
| Scope | `scim` |

> SCIM provisioning on a custom app is only offered on **SAML** or **SWA** app
> types (not OIDC). For public catalog distribution with the Authorization-Code +
> refresh-token flow, see the **OIN** runbook at `/docs/oin`.

## Getting a token (no Okta needed)

```bash
# Client credentials (machine-to-machine)
curl -s -X POST http://localhost:8080/realms/scim/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id=okta-provisioning -d client_secret=7Qhq86B8mibREt7hoTcjBzSEO2NvMJlb \
  -d scope=scim

# Resource-owner password (as the test user)
curl -s -X POST http://localhost:8080/realms/scim/protocol/openid-connect/token \
  -d grant_type=password -d username=alice -d password=alice \
  -d client_id=scim-client -d client_secret=w_ZeIPDTrGvDwE9sb0fWQPXV-AZqmU-7 \
  -d scope=scim
```

Use the returned `access_token` as a Bearer token:

```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/scim/v2/Users
```

## Deployment (always-on)

The whole stack is containerized so it runs on a free always-on VM (e.g. Oracle
Cloud Always-Free) with one command and survives reboots (`restart: unless-stopped`).

| File | Purpose |
|---|---|
| `Dockerfile` + `docker-entrypoint.sh` | App image (multi-arch; runs `prisma migrate deploy` on boot) |
| `docker-compose.prod.yml` | Full stack behind **ngrok** |
| `docker-compose.caddy.yml` | Full stack behind **Caddy** (auto Let's Encrypt TLS) + a **DuckDNS** updater |
| `deploy/README-oracle.md` | Step-by-step Oracle Always-Free VM runbook (both paths) |
| `deploy/.env.deploy.example` | VM-side env template |

```bash
# on the VM (see deploy/README-oracle.md)
docker compose -f docker-compose.prod.yml up -d --build     # ngrok path
docker compose -f docker-compose.caddy.yml up -d --build    # Caddy + DuckDNS path
```

For a local Caddy/DuckDNS run: `npm run demo:start:caddy` (needs a `.env.caddy`,
a domain pointing at your machine, and ports 80/443 reachable).

## SCIM behavior notes

- User lifecycle: Okta deactivates users via `PATCH /Users/:id` with
  `{"op":"replace","value":{"active":false}}` rather than `DELETE` — both are
  supported.
- Group membership changes arrive as `PATCH /Groups/:id` with `add`/`remove`
  operations on the `members` path.
- `GET /Users?filter=userName eq "..."` and
  `GET /Groups?filter=displayName eq "..."` — only the `eq` operator is
  implemented, since that's all Okta's connector sends.
- Discovery endpoints are intentionally unauthenticated, matching common SCIM
  server practice.

## Development

```bash
npm run start:dev      # watch mode
npm run prisma:studio  # inspect the database
npm run test           # unit tests
npm run test:e2e       # e2e tests
```

> Demo conveniences (low token lifespan, full tokens shown in the `/home` log,
> secrets printed on `/docs` pages) are intentional for this demo — revert them
> before any real deployment.
