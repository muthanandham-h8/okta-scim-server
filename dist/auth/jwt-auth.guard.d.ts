import { CanActivate, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
export declare class JwtAuthGuard implements CanActivate {
    private readonly config;
    private readonly logger;
    private readonly issuer;
    private readonly audience?;
    private readonly requiredScope;
    private readonly jwks;
    constructor(config: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private hasRequiredScope;
}
