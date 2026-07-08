-- Keycloak is now the authorization server; drop this app's OAuth tables.

-- DropForeignKey
ALTER TABLE "oauth_access_tokens" DROP CONSTRAINT "oauth_access_tokens_clientId_fkey";

-- DropForeignKey
ALTER TABLE "oauth_authorization_codes" DROP CONSTRAINT "oauth_authorization_codes_clientId_fkey";

-- DropForeignKey
ALTER TABLE "oauth_refresh_tokens" DROP CONSTRAINT "oauth_refresh_tokens_accessTokenId_fkey";

-- DropForeignKey
ALTER TABLE "oauth_refresh_tokens" DROP CONSTRAINT "oauth_refresh_tokens_clientId_fkey";

-- DropTable
DROP TABLE "oauth_access_tokens";

-- DropTable
DROP TABLE "oauth_authorization_codes";

-- DropTable
DROP TABLE "oauth_clients";

-- DropTable
DROP TABLE "oauth_refresh_tokens";
