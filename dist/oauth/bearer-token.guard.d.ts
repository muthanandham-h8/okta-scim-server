import { CanActivate, ExecutionContext } from '@nestjs/common';
import { OAuthService } from './oauth.service';
export declare class BearerTokenGuard implements CanActivate {
    private readonly oauth;
    constructor(oauth: OAuthService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
