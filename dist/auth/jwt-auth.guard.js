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
        var _a, _b, _c, _d, _e, _f, _g;
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            this.logger.warn(`Auth REJECTED: no Bearer token on ${req.method} ${req.originalUrl}`);
            throw new common_1.UnauthorizedException('Bearer token required');
        }
        const token = header.slice('Bearer '.length).trim();
        this.logger.debug(`Bearer token received (len=${token.length}): ${token.slice(0, 16)}…${token.slice(-8)}`);
        let payload;
        try {
            const { payload: p, protectedHeader } = await (0, jose_1.jwtVerify)(token, this.jwks, Object.assign({ issuer: this.issuer }, (this.audience ? { audience: this.audience } : {})));
            payload = p;
            const iso = (n) => (typeof n === 'number' ? new Date(n * 1000).toISOString() : '—');
            this.logger.log(`JWT verified | alg=${protectedHeader.alg} kid=${protectedHeader.kid} ` +
                `iss=${payload.iss} sub=${payload.sub} ` +
                `client=${(_b = (_a = payload.azp) !== null && _a !== void 0 ? _a : payload.client_id) !== null && _b !== void 0 ? _b : '—'} ` +
                `aud=${(_c = JSON.stringify(payload.aud)) !== null && _c !== void 0 ? _c : '—'} scope="${(_d = payload.scope) !== null && _d !== void 0 ? _d : ''}" ` +
                `iat=${iso(payload.iat)} exp=${iso(payload.exp)}`);
        }
        catch (err) {
            this.logger.warn(`JWT verification FAILED: ${err.message}`);
            throw new common_1.UnauthorizedException('invalid or expired access token');
        }
        if (!this.hasRequiredScope(payload)) {
            this.logger.warn(`Authz DENIED: token scope "${(_e = payload.scope) !== null && _e !== void 0 ? _e : ''}" is missing required "${this.requiredScope}"`);
            throw new common_1.UnauthorizedException(`token missing required scope "${this.requiredScope}"`);
        }
        this.logger.debug(`Authz OK: required scope "${this.requiredScope}" present`);
        req.auth = payload;
        req.oauthClientId =
            (_g = (_f = payload.azp) !== null && _f !== void 0 ? _f : payload.client_id) !== null && _g !== void 0 ? _g : payload.sub;
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