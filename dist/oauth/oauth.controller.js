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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const oauth_service_1 = require("./oauth.service");
function parseBasicAuth(header) {
    if (!header || !header.startsWith('Basic '))
        return null;
    const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
    const idx = decoded.indexOf(':');
    if (idx === -1)
        return null;
    return { clientId: decoded.slice(0, idx), clientSecret: decoded.slice(idx + 1) };
}
let OAuthController = class OAuthController {
    constructor(oauth, config) {
        this.oauth = oauth;
        this.config = config;
    }
    async authorize(responseType, clientId, redirectUri, scope, state, res) {
        if (responseType !== 'code') {
            throw new common_1.BadRequestException('unsupported_response_type');
        }
        const client = await this.oauth.findClientById(clientId);
        if (!client) {
            throw new common_1.BadRequestException('invalid_client');
        }
        this.oauth.validateRedirectUri(client, redirectUri);
        res.type('html').send(renderLoginPage({ clientId, redirectUri, scope, state, error: null }));
    }
    async approve(clientId, redirectUri, scope, state, username, password, res) {
        const client = await this.oauth.findClientById(clientId);
        if (!client) {
            throw new common_1.BadRequestException('invalid_client');
        }
        this.oauth.validateRedirectUri(client, redirectUri);
        const adminUser = this.config.get('ADMIN_USERNAME');
        const adminPass = this.config.get('ADMIN_PASSWORD');
        if (username !== adminUser || password !== adminPass) {
            res
                .type('html')
                .status(401)
                .send(renderLoginPage({ clientId, redirectUri, scope, state, error: 'Invalid credentials' }));
            return;
        }
        const code = await this.oauth.createAuthorizationCode(client, redirectUri, scope);
        const url = new URL(redirectUri);
        url.searchParams.set('code', code);
        if (state)
            url.searchParams.set('state', state);
        res.redirect(url.toString());
    }
    async token(grantType, code, redirectUri, refreshToken, bodyClientId, bodyClientSecret, authHeader) {
        var _a, _b;
        const basic = parseBasicAuth(authHeader);
        const clientId = (_a = basic === null || basic === void 0 ? void 0 : basic.clientId) !== null && _a !== void 0 ? _a : bodyClientId;
        const clientSecret = (_b = basic === null || basic === void 0 ? void 0 : basic.clientSecret) !== null && _b !== void 0 ? _b : bodyClientSecret;
        if (!clientId || !clientSecret) {
            throw new common_1.UnauthorizedException('invalid_client');
        }
        const client = await this.oauth.validateClientCredentials(clientId, clientSecret);
        if (grantType === 'authorization_code') {
            if (!code || !redirectUri)
                throw new common_1.BadRequestException('invalid_request');
            return this.oauth.exchangeAuthorizationCode(code, redirectUri, client);
        }
        if (grantType === 'refresh_token') {
            if (!refreshToken)
                throw new common_1.BadRequestException('invalid_request');
            return this.oauth.refreshAccessToken(refreshToken, client);
        }
        throw new common_1.BadRequestException('unsupported_grant_type');
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, common_1.Get)('authorize'),
    __param(0, (0, common_1.Query)('response_type')),
    __param(1, (0, common_1.Query)('client_id')),
    __param(2, (0, common_1.Query)('redirect_uri')),
    __param(3, (0, common_1.Query)('scope')),
    __param(4, (0, common_1.Query)('state')),
    __param(5, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "authorize", null);
__decorate([
    (0, common_1.Post)('authorize'),
    __param(0, (0, common_1.Body)('client_id')),
    __param(1, (0, common_1.Body)('redirect_uri')),
    __param(2, (0, common_1.Body)('scope')),
    __param(3, (0, common_1.Body)('state')),
    __param(4, (0, common_1.Body)('username')),
    __param(5, (0, common_1.Body)('password')),
    __param(6, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "approve", null);
__decorate([
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Body)('grant_type')),
    __param(1, (0, common_1.Body)('code')),
    __param(2, (0, common_1.Body)('redirect_uri')),
    __param(3, (0, common_1.Body)('refresh_token')),
    __param(4, (0, common_1.Body)('client_id')),
    __param(5, (0, common_1.Body)('client_secret')),
    __param(6, (0, common_1.Headers)('authorization')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String, String, String, String]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "token", null);
exports.OAuthController = OAuthController = __decorate([
    (0, common_1.Controller)('oauth'),
    __metadata("design:paramtypes", [oauth_service_1.OAuthService,
        config_1.ConfigService])
], OAuthController);
function escapeHtml(value) {
    return String(value !== null && value !== void 0 ? value : '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function renderLoginPage(params) {
    const clientId = escapeHtml(params.clientId);
    const redirectUri = escapeHtml(params.redirectUri);
    const scope = escapeHtml(params.scope);
    const state = escapeHtml(params.state);
    const error = params.error ? escapeHtml(params.error) : null;
    return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Authorize Okta SCIM Access</title></head>
<body style="font-family: sans-serif; max-width: 360px; margin: 80px auto;">
  <h2>Authorize Okta Provisioning</h2>
  <p>Sign in as an administrator to allow Okta to manage users and groups.</p>
  ${error ? `<p style="color:red">${error}</p>` : ''}
  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="client_id" value="${clientId}" />
    <input type="hidden" name="redirect_uri" value="${redirectUri}" />
    <input type="hidden" name="scope" value="${scope}" />
    <input type="hidden" name="state" value="${state}" />
    <div><label>Username<br/><input name="username" autofocus /></label></div>
    <div style="margin-top:8px"><label>Password<br/><input name="password" type="password" /></label></div>
    <button type="submit" style="margin-top:16px">Allow Access</button>
  </form>
</body>
</html>`;
}
//# sourceMappingURL=oauth.controller.js.map