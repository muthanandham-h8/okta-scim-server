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
exports.DocsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const docs_page_1 = require("./docs.page");
const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
let DocsController = class DocsController {
    constructor(config) {
        this.config = config;
    }
    cfg() {
        const base = this.config.get('PUBLIC_BASE_URL', 'http://localhost:3000');
        const realm = this.config.get('KEYCLOAK_REALM', 'scim');
        const issuer = this.config.get('KEYCLOAK_ISSUER') || `${base}/realms/${realm}`;
        return {
            scimBase: `${base}/scim/v2`,
            tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
            authEndpoint: `${issuer}/protocol/openid-connect/auth`,
            clientId: 'okta-provisioning',
            clientSecret: '7Qhq86B8mibREt7hoTcjBzSEO2NvMJlb',
            scope: this.config.get('KEYCLOAK_REQUIRED_SCOPE', 'scim'),
            buildId: BUILD_ID,
        };
    }
    index() {
        return (0, docs_page_1.renderDocsIndex)(this.cfg());
    }
    method(method, res) {
        const slug = docs_page_1.METHOD_SLUGS.find((s) => s === method);
        if (!slug) {
            res.redirect(302, '/docs');
            return;
        }
        res
            .type('text/html; charset=utf-8')
            .set('Cache-Control', 'no-store')
            .send((0, docs_page_1.renderMethodPage)(slug, this.cfg()));
    }
};
exports.DocsController = DocsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], DocsController.prototype, "index", null);
__decorate([
    (0, common_1.Get)(':method'),
    __param(0, (0, common_1.Param)('method')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", void 0)
], DocsController.prototype, "method", null);
exports.DocsController = DocsController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('docs'),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DocsController);
//# sourceMappingURL=docs.controller.js.map