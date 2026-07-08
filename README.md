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
- `prisma/schema.prisma` — Postgres models for SCIM users/groups only.

```
Okta (client) ──get token──▶ Keycloak (issuer) ──JWT──▶ Okta
Okta ──Bearer JWT──▶ /scim/v2/*  ──verify signature via JWKS──▶ Keycloak
```

## Setup

1. Start Postgres **and** Keycloak:
   ```bash
   docker compose up -d
   ```
   Keycloak comes up on http://localhost:8080 (admin `admin`/`admin`) and
   auto-imports the `scim` realm with a client and a test user.
2. Install dependencies and run migrations:
   ```bash
   npm install
   npm run prisma:migrate   # or: npx prisma migrate deploy
   ```
3. Review `.env` — the Keycloak issuer/JWKS URLs and required scope.
4. Run the server:
   ```bash
   npm run build && npm run start:prod
   # or for local development:
   npm run start:dev
   ```

### What the imported realm contains

| Thing | Value |
|---|---|
| Realm | `scim` |
| Client ID | `scim-client` |
| Client secret | `scim-client-secret` |
| Test user | `alice` / `alice` |
| Scope | `scim` (default client scope, appears in the token) |
| Issuer | `http://localhost:8080/realms/scim` |

## Configuring Okta (production)

In Okta's SCIM setup, point the OAuth endpoints at **Keycloak** (not this
service), and the SCIM base URL at this service:

| Okta field | Value |
|---|---|
| Authorization endpoint | `https://<keycloak>/realms/scim/protocol/openid-connect/auth` |
| Token endpoint | `https://<keycloak>/realms/scim/protocol/openid-connect/token` |
| Client ID / Secret | a client you register in Keycloak for Okta |
| Scopes | `scim` |
| SCIM base URL | `https://<this-service>/scim/v2` |

## Getting a token (no Okta needed)

Any standard OAuth2 grant against Keycloak works. Two easy ones for testing:

```bash
# Client credentials (machine-to-machine)
curl -s -X POST http://localhost:8080/realms/scim/protocol/openid-connect/token \
  -d grant_type=client_credentials \
  -d client_id=scim-client -d client_secret=scim-client-secret \
  -d scope=scim

# Resource-owner password (as the test user)
curl -s -X POST http://localhost:8080/realms/scim/protocol/openid-connect/token \
  -d grant_type=password -d username=alice -d password=alice \
  -d client_id=scim-client -d client_secret=scim-client-secret \
  -d scope=scim
```

Both return an `access_token` (a JWT). Use it as a Bearer token:

```bash
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/scim/v2/Users
```

## API docs (Swagger)

Interactive docs at http://localhost:3000/docs. Two ways to authenticate:

- **keycloak-jwt** — paste a JWT from the commands above.
- **keycloak-oauth2** — let Swagger run Keycloak's Authorization Code flow
  (uses `scim-client`; the realm registers Swagger's redirect URI).

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
