import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { createRemoteJWKSet, jwtVerify, JWTPayload } from 'jose';

/**
 * Validates Keycloak-issued JWT access tokens.
 *
 * Unlike the old opaque-token guard, this performs NO database lookup: it
 * verifies the token's signature against Keycloak's published public keys
 * (JWKS) and checks the issuer/audience. Keycloak is the source of truth for
 * the token; this server only trusts its signature.
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
  private readonly logger = new Logger(JwtAuthGuard.name);
  private readonly issuer: string;
  private readonly audience?: string;
  private readonly requiredScope: string;
  private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

  constructor(private readonly config: ConfigService) {
    this.issuer = this.config.getOrThrow<string>('KEYCLOAK_ISSUER');
    this.audience = this.config.get<string>('KEYCLOAK_AUDIENCE') || undefined;
    this.requiredScope = this.config.get<string>('KEYCLOAK_REQUIRED_SCOPE', 'scim');

    const jwksUri =
      this.config.get<string>('KEYCLOAK_JWKS_URI') ||
      `${this.issuer}/protocol/openid-connect/certs`;
    // createRemoteJWKSet caches keys in-memory and refetches on key rotation,
    // so signature checks are local after the first request.
    this.jwks = createRemoteJWKSet(new URL(jwksUri));
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      this.logger.warn(
        `Auth REJECTED: no Bearer token on ${req.method} ${req.originalUrl}`,
      );
      throw new UnauthorizedException('Bearer token required');
    }
    const token = header.slice('Bearer '.length).trim();
    this.logger.debug(
      `Bearer token received (len=${token.length}): ${token.slice(0, 16)}…${token.slice(-8)}`,
    );

    let payload: JWTPayload;
    try {
      const { payload: p, protectedHeader } = await jwtVerify(token, this.jwks, {
        issuer: this.issuer,
        ...(this.audience ? { audience: this.audience } : {}),
      });
      payload = p;
      const iso = (n?: number) => (typeof n === 'number' ? new Date(n * 1000).toISOString() : '—');
      this.logger.log(
        `JWT verified | alg=${protectedHeader.alg} kid=${protectedHeader.kid} ` +
          `iss=${payload.iss} sub=${payload.sub} ` +
          `client=${(payload.azp as string) ?? (payload.client_id as string) ?? '—'} ` +
          `aud=${JSON.stringify(payload.aud) ?? '—'} scope="${(payload.scope as string) ?? ''}" ` +
          `iat=${iso(payload.iat)} exp=${iso(payload.exp)}`,
      );
    } catch (err) {
      this.logger.warn(`JWT verification FAILED: ${(err as Error).message}`);
      throw new UnauthorizedException('invalid or expired access token');
    }

    if (!this.hasRequiredScope(payload)) {
      this.logger.warn(
        `Authz DENIED: token scope "${(payload.scope as string) ?? ''}" is missing required "${this.requiredScope}"`,
      );
      throw new UnauthorizedException(`token missing required scope "${this.requiredScope}"`);
    }
    this.logger.debug(`Authz OK: required scope "${this.requiredScope}" present`);

    // Expose useful claims to downstream handlers, mirroring the old guard's
    // req.oauthClientId contract.
    (req as Request & { auth?: JWTPayload }).auth = payload;
    (req as Request & { oauthClientId?: string }).oauthClientId =
      (payload.azp as string) ?? (payload.client_id as string) ?? (payload.sub as string);
    return true;
  }

  /** Keycloak puts granted scopes in the space-delimited `scope` claim. */
  private hasRequiredScope(payload: JWTPayload): boolean {
    const scopeClaim = typeof payload.scope === 'string' ? payload.scope : '';
    return scopeClaim.split(' ').includes(this.requiredScope);
  }
}
