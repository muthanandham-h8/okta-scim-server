import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { OAuthService } from './oauth.service';

@Injectable()
export class BearerTokenGuard implements CanActivate {
  constructor(private readonly oauth: OAuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;

    if (!header || !header.startsWith('Bearer ')) {
      throw new UnauthorizedException('Bearer token required');
    }

    const token = header.slice('Bearer '.length).trim();
    const record = await this.oauth.validateAccessToken(token);
    if (!record) {
      throw new UnauthorizedException('invalid or expired access token');
    }

    (req as Request & { oauthClientId: string }).oauthClientId = record.clientId;
    return true;
  }
}
