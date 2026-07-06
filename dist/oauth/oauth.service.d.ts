import { ConfigService } from '@nestjs/config';
import { OAuthClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export interface TokenResponse {
    access_token: string;
    refresh_token: string;
    token_type: 'Bearer';
    expires_in: number;
    scope: string;
}
export declare class OAuthService {
    private readonly prisma;
    private readonly config;
    constructor(prisma: PrismaService, config: ConfigService);
    findClientById(clientId: string): Promise<OAuthClient | null>;
    validateClientCredentials(clientId: string, clientSecret: string): Promise<OAuthClient>;
    validateRedirectUri(client: OAuthClient, redirectUri: string): void;
    createAuthorizationCode(client: OAuthClient, redirectUri: string, scope: string): Promise<string>;
    exchangeAuthorizationCode(code: string, redirectUri: string, client: OAuthClient): Promise<TokenResponse>;
    refreshAccessToken(refreshToken: string, client: OAuthClient): Promise<TokenResponse>;
    private issueTokens;
    validateAccessToken(token: string): Promise<{
        id: string;
        clientId: string;
        createdAt: Date;
        scope: string;
        expiresAt: Date;
        token: string;
        revoked: boolean;
    }>;
}
