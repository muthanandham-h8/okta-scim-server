"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var JwtAuthGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtAuthGuard = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const jose_1 = require("jose");
let JwtAuthGuard = JwtAuthGuard_1 = class JwtAuthGuard {
    constructor(config) {
        this.config = config;
        this.logger = new common_1.Logger(JwtAuthGuard_1.name);
        this.issuer = this.config.getOrThrow('KEYCLOAK_ISSUER');
        this.audience = this.config.get('KEYCLOAK_AUDIENCE') || undefined;
        this.requiredScope = this.config.get('KEYCLOAK_REQUIRED_SCOPE', 'scim');
        const jwksUri = this.config.get('KEYCLOAK_JWKS_URI') ||
            `${this.issuer}/protocol/openid-connect/certs`;
        this.jwks = (0, jose_1.createRemoteJWKSet)(new URL(jwksUri));
    }
    async canActivate(context) {
        var _a, _b;
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Bearer token required');
        }
        const token = header.slice('Bearer '.length).trim();
        let payload;
        try {
            ({ payload } = await (0, jose_1.jwtVerify)(token, this.jwks, Object.assign({ issuer: this.issuer }, (this.audience ? { audience: this.audience } : {}))));
        }
        catch (err) {
            this.logger.warn(`JWT verification failed: ${err.message}`);
            throw new common_1.UnauthorizedException('invalid or expired access token');
        }
        if (!this.hasRequiredScope(payload)) {
            throw new common_1.UnauthorizedException(`token missing required scope "${this.requiredScope}"`);
        }
        req.auth = payload;
        req.oauthClientId =
            (_b = (_a = payload.azp) !== null && _a !== void 0 ? _a : payload.client_id) !== null && _b !== void 0 ? _b : payload.sub;
        return true;
    }
    hasRequiredScope(payload) {
        const scopeClaim = typeof payload.scope === 'string' ? payload.scope : '';
        return scopeClaim.split(' ').includes(this.requiredScope);
    }
};
exports.JwtAuthGuard = JwtAuthGuard;
exports.JwtAuthGuard = JwtAuthGuard = JwtAuthGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], JwtAuthGuard);
//# sourceMappingURL=jwt-auth.guard.js.map