import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OAuthService } from './oauth.service';
export declare class OAuthController {
    private readonly oauth;
    private readonly config;
    constructor(oauth: OAuthService, config: ConfigService);
    authorize(responseType: string, clientId: string, redirectUri: string, scope: string, state: string, res: Response): Promise<void>;
    approve(clientId: string, redirectUri: string, scope: string, state: string, username: string, password: string, res: Response): Promise<void>;
    token(grantType: string, code: string, redirectUri: string, refreshToken: string, bodyClientId: string, bodyClientSecret: string, authHeader: string): Promise<import("./oauth.service").TokenResponse>;
}
