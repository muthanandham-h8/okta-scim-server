-- CreateTable
CREATE TABLE "scim_users" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "userName" TEXT NOT NULL,
    "givenName" TEXT,
    "familyName" TEXT,
    "email" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "passwordHash" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scim_groups" (
    "id" TEXT NOT NULL,
    "externalId" TEXT,
    "displayName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "scim_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scim_group_members" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "scim_group_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_clients" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "clientSecret" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "redirectUris" TEXT[],
    "scopes" TEXT[] DEFAULT ARRAY['scim']::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_authorization_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "redirectUri" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_authorization_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_access_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_access_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "oauth_refresh_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "accessTokenId" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "oauth_refresh_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "scim_users_userName_key" ON "scim_users"("userName");

-- CreateIndex
CREATE UNIQUE INDEX "scim_groups_displayName_key" ON "scim_groups"("displayName");

-- CreateIndex
CREATE UNIQUE INDEX "scim_group_members_groupId_userId_key" ON "scim_group_members"("groupId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_clients_clientId_key" ON "oauth_clients"("clientId");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_authorization_codes_code_key" ON "oauth_authorization_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_access_tokens_token_key" ON "oauth_access_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_refresh_tokens_token_key" ON "oauth_refresh_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "oauth_refresh_tokens_accessTokenId_key" ON "oauth_refresh_tokens"("accessTokenId");

-- AddForeignKey
ALTER TABLE "scim_group_members" ADD CONSTRAINT "scim_group_members_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "scim_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scim_group_members" ADD CONSTRAINT "scim_group_members_userId_fkey" FOREIGN KEY ("userId") REFERENCES "scim_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_authorization_codes" ADD CONSTRAINT "oauth_authorization_codes_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_access_tokens" ADD CONSTRAINT "oauth_access_tokens_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "oauth_clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "oauth_refresh_tokens" ADD CONSTRAINT "oauth_refresh_tokens_accessTokenId_fkey" FOREIGN KEY ("accessTokenId") REFERENCES "oauth_access_tokens"("id") ON DELETE SET NULL ON UPDATE CASCADE;
