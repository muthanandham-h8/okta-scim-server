# Okta SCIM 2.0 Server

A SCIM 2.0 provisioning server (NestJS + Prisma/PostgreSQL) that Okta can use
to automatically create, update, deactivate, and group users, secured by an
OAuth 2.0 authorization server built into this same app.

Built against Okta's requirements described in
[Build your SCIM API service](https://developer.okta.com/docs/guides/scim-provisioning-integration-prepare/main/).
Key constraint: **Okta only supports the OAuth 2.0 Authorization Code grant
for SCIM** (not client credentials), and will use the refresh token grant if
your authorization server supports it — both are implemented here.

## Architecture

- `src/oauth` — OAuth 2.0 authorization server: `/oauth/authorize` (auth-code
  issuance behind an admin login form) and `/oauth/token` (`authorization_code`
  and `refresh_token` grants, with refresh token rotation).
- `src/scim` — SCIM 2.0 resource server: `/scim/v2/Users`, `/scim/v2/Groups`,
  and discovery endpoints (`ServiceProviderConfig`, `ResourceTypes`,
  `Schemas`), all protected by a Bearer-token guard that validates access
  tokens issued by the OAuth module.
- `prisma/schema.prisma` — Postgres models for SCIM users/groups and the
  OAuth clients/codes/tokens.

## Setup

1. Start Postgres:
   ```bash
   docker compose up -d postgres
   ```
2. Install dependencies and run migrations:
   ```bash
   npm install
   npm run prisma:migrate
   ```
3. Review `.env` — in particular set a real `ADMIN_PASSWORD` and
   `PUBLIC_BASE_URL` (must be HTTPS and publicly reachable for Okta to call
   back to it).
4. Register an OAuth client for Okta:
   ```bash
   npm run seed:client -- --name "Okta" \
     --redirect-uri "https://system-admin.okta.com/admin/app/cpc/<appName>/oauth/callback" \
     --redirect-uri "https://system-admin.okta-emea.com/admin/app/cpc/<appName>/oauth/callback" \
     --redirect-uri "https://system-admin.oktapreview.com/admin/app/cpc/<appName>/oauth/callback"
   ```
   This prints a `client_id` and `client_secret` — save them, the secret is
   not stored anywhere retrievable afterwards. Add every redirect URI Okta's
   OIN wizard lists for your target environment(s).
5. Run the server:
   ```bash
   npm run build && npm run start:prod
   # or for local development:
   npm run start:dev
   ```

## Configuring Okta

In the Okta admin console, under the app's **Provisioning → Configure API
Integration**, choose **OAuth 2.0** as the authentication mode and enter:

| Okta field | Value |
|---|---|
| Authorization endpoint | `https://<PUBLIC_BASE_URL>/oauth/authorize` |
| Token endpoint | `https://<PUBLIC_BASE_URL>/oauth/token` |
| Client ID | from `npm run seed:client` |
| Client Secret | from `npm run seed:client` |
| Scopes | `scim` |
| SCIM base URL | `https://<PUBLIC_BASE_URL>/scim/v2` |

When you click **Authenticate with OAuth 2.0**, Okta opens
`/oauth/authorize` in a browser popup; sign in with `ADMIN_USERNAME` /
`ADMIN_PASSWORD` from `.env` to approve the grant. Okta then exchanges the
resulting code for an access + refresh token pair and stores them, refreshing
automatically before expiry.

## SCIM behavior notes

- User lifecycle: Okta deactivates users via `PATCH /Users/:id` with
  `{"op":"replace","value":{"active":false}}` rather than `DELETE` — both are
  supported.
- Group membership changes arrive as `PATCH /Groups/:id` with `add`/`remove`
  operations on the `members` path.
- `GET /Users?filter=userName eq "..."` and
  `GET /Groups?filter=displayName eq "..."` are used by Okta to check for
  existing resources before creating new ones — only the `eq` operator is
  implemented, since that's all Okta's connector sends.
- Discovery endpoints (`ServiceProviderConfig`, `ResourceTypes`, `Schemas`)
  are intentionally left unauthenticated, matching common SCIM server
  practice.

## Manual smoke test

With the server running and a client registered:

```bash
# 1. Get an authorization code (simulates the Okta browser redirect)
curl -i -X POST http://localhost:3000/oauth/authorize \
  --data-urlencode "client_id=<client_id>" \
  --data-urlencode "redirect_uri=<one of your registered redirect_uris>" \
  --data-urlencode "scope=scim" \
  --data-urlencode "username=<ADMIN_USERNAME>" \
  --data-urlencode "password=<ADMIN_PASSWORD>"
# -> 302 redirect with ?code=...

# 2. Exchange the code for tokens
curl -u <client_id>:<client_secret> -X POST http://localhost:3000/oauth/token \
  --data-urlencode "grant_type=authorization_code" \
  --data-urlencode "code=<code>" \
  --data-urlencode "redirect_uri=<same redirect_uri>"

# 3. Call SCIM endpoints with the access token
curl -H "Authorization: Bearer <access_token>" http://localhost:3000/scim/v2/Users

# 4. Refresh when the access token expires
curl -u <client_id>:<client_secret> -X POST http://localhost:3000/oauth/token \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "refresh_token=<refresh_token>"
```

## Development

```bash
npm run start:dev      # watch mode
npm run prisma:studio  # inspect the database
npm run test           # unit tests
npm run test:e2e       # e2e tests
```
