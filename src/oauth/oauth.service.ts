import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuthClient } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { generateToken } from '../common/tokens';

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
  scope: string;
}

@Injectable()
export class OAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async findClientById(clientId: string): Promise<OAuthClient | null> {
    return this.prisma.oAuthClient.findUnique({ where: { clientId } });
  }

  async validateClientCredentials(clientId: string, clientSecret: string): Promise<OAuthClient> {
    const client = await this.findClientById(clientId);
    if (!client || client.clientSecret !== clientSecret) {
      throw new UnauthorizedException('invalid_client');
    }
    return client;
  }

  validateRedirectUri(client: OAuthClient, redirectUri: string): void {
    if (!client.redirectUris.includes(redirectUri)) {
      throw new BadRequestException('invalid_redirect_uri');
    }
  }

  async createAuthorizationCode(client: OAuthClient, redirectUri: string, scope: string): Promise<string> {
    const code = generateToken('ac');
    const ttl = Number(this.config.get('AUTHORIZATION_CODE_TTL', 600));
    await this.prisma.authorizationCode.create({
      data: {
        code,
        clientId: client.id,
        redirectUri,
        scope: scope || 'scim',
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });
    return code;
  }

  async exchangeAuthorizationCode(
    code: string,
    redirectUri: string,
    client: OAuthClient,
  ): Promise<TokenResponse> {
    const record = await this.prisma.authorizationCode.findUnique({ where: { code } });

    if (!record || record.clientId !== client.id) {
      throw new BadRequestException('invalid_grant');
    }
    if (record.used || record.expiresAt < new Date()) {
      throw new BadRequestException('invalid_grant');
    }
    if (record.redirectUri !== redirectUri) {
      throw new BadRequestException('invalid_grant');
    }

    await this.prisma.authorizationCode.update({
      where: { code },
      data: { used: true },
    });

    return this.issueTokens(client, record.scope);
  }

  async refreshAccessToken(refreshToken: string, client: OAuthClient): Promise<TokenResponse> {
    const record = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });

    if (!record || record.clientId !== client.id || record.revoked || record.expiresAt < new Date()) {
      throw new BadRequestException('invalid_grant');
    }

    // Rotate: revoke the old refresh token and its paired access token, issue a new pair.
    await this.prisma.$transaction([
      this.prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } }),
      this.prisma.accessToken.updateMany({
        where: { id: record.accessTokenId ?? undefined },
        data: { revoked: true },
      }),
    ]);

    return this.issueTokens(client, record.scope);
  }

  private async issueTokens(client: OAuthClient, scope: string): Promise<TokenResponse> {
    const accessTtl = Number(this.config.get('ACCESS_TOKEN_TTL', 3600));
    const refreshTtl = Number(this.config.get('REFRESH_TOKEN_TTL', 2592000));

    const accessToken = await this.prisma.accessToken.create({
      data: {
        token: generateToken('at'),
        clientId: client.id,
        scope,
        expiresAt: new Date(Date.now() + accessTtl * 1000),
      },
    });

    const refreshToken = await this.prisma.refreshToken.create({
      data: {
        token: generateToken('rt'),
        clientId: client.id,
        scope,
        accessTokenId: accessToken.id,
        expiresAt: new Date(Date.now() + refreshTtl * 1000),
      },
    });

    return {
      access_token: accessToken.token,
      refresh_token: refreshToken.token,
      token_type: 'Bearer',
      expires_in: accessTtl,
      scope,
    };
  }

  async validateAccessToken(token: string) {
    const record = await this.prisma.accessToken.findUnique({ where: { token } });
    if (!record || record.revoked || record.expiresAt < new Date()) {
      return null;
    }
    return record;
  }
}
