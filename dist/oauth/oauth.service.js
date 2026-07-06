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
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const tokens_1 = require("../common/tokens");
let OAuthService = class OAuthService {
    constructor(prisma, config) {
        this.prisma = prisma;
        this.config = config;
    }
    async findClientById(clientId) {
        return this.prisma.oAuthClient.findUnique({ where: { clientId } });
    }
    async validateClientCredentials(clientId, clientSecret) {
        const client = await this.findClientById(clientId);
        if (!client || client.clientSecret !== clientSecret) {
            throw new common_1.UnauthorizedException('invalid_client');
        }
        return client;
    }
    validateRedirectUri(client, redirectUri) {
        if (!client.redirectUris.includes(redirectUri)) {
            throw new common_1.BadRequestException('invalid_redirect_uri');
        }
    }
    async createAuthorizationCode(client, redirectUri, scope) {
        const code = (0, tokens_1.generateToken)('ac');
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
    async exchangeAuthorizationCode(code, redirectUri, client) {
        const record = await this.prisma.authorizationCode.findUnique({ where: { code } });
        if (!record || record.clientId !== client.id) {
            throw new common_1.BadRequestException('invalid_grant');
        }
        if (record.used || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('invalid_grant');
        }
        if (record.redirectUri !== redirectUri) {
            throw new common_1.BadRequestException('invalid_grant');
        }
        await this.prisma.authorizationCode.update({
            where: { code },
            data: { used: true },
        });
        return this.issueTokens(client, record.scope);
    }
    async refreshAccessToken(refreshToken, client) {
        var _a;
        const record = await this.prisma.refreshToken.findUnique({ where: { token: refreshToken } });
        if (!record || record.clientId !== client.id || record.revoked || record.expiresAt < new Date()) {
            throw new common_1.BadRequestException('invalid_grant');
        }
        await this.prisma.$transaction([
            this.prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } }),
            this.prisma.accessToken.updateMany({
                where: { id: (_a = record.accessTokenId) !== null && _a !== void 0 ? _a : undefined },
                data: { revoked: true },
            }),
        ]);
        return this.issueTokens(client, record.scope);
    }
    async issueTokens(client, scope) {
        const accessTtl = Number(this.config.get('ACCESS_TOKEN_TTL', 3600));
        const refreshTtl = Number(this.config.get('REFRESH_TOKEN_TTL', 2592000));
        const accessToken = await this.prisma.accessToken.create({
            data: {
                token: (0, tokens_1.generateToken)('at'),
                clientId: client.id,
                scope,
                expiresAt: new Date(Date.now() + accessTtl * 1000),
            },
        });
        const refreshToken = await this.prisma.refreshToken.create({
            data: {
                token: (0, tokens_1.generateToken)('rt'),
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
    async validateAccessToken(token) {
        const record = await this.prisma.accessToken.findUnique({ where: { token } });
        if (!record || record.revoked || record.expiresAt < new Date()) {
            return null;
        }
        return record;
    }
};
exports.OAuthService = OAuthService;
exports.OAuthService = OAuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        config_1.ConfigService])
], OAuthService);
//# sourceMappingURL=oauth.service.js.map