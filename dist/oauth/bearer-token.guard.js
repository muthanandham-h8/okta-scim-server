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
exports.BearerTokenGuard = void 0;
const common_1 = require("@nestjs/common");
const oauth_service_1 = require("./oauth.service");
let BearerTokenGuard = class BearerTokenGuard {
    constructor(oauth) {
        this.oauth = oauth;
    }
    async canActivate(context) {
        const req = context.switchToHttp().getRequest();
        const header = req.headers.authorization;
        if (!header || !header.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Bearer token required');
        }
        const token = header.slice('Bearer '.length).trim();
        const record = await this.oauth.validateAccessToken(token);
        if (!record) {
            throw new common_1.UnauthorizedException('invalid or expired access token');
        }
        req.oauthClientId = record.clientId;
        return true;
    }
};
exports.BearerTokenGuard = BearerTokenGuard;
exports.BearerTokenGuard = BearerTokenGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService])
], BearerTokenGuard);
//# sourceMappingURL=bearer-token.guard.js.map