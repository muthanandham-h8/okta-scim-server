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
exports.DemoController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const config_1 = require("@nestjs/config");
const prisma_service_1 = require("../prisma/prisma.service");
const demo_page_1 = require("./demo.page");
const events_store_1 = require("./events.store");
const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
let DemoController = class DemoController {
    constructor(prisma, events, config) {
        this.prisma = prisma;
        this.events = events;
        this.config = config;
    }
    demoConfig() {
        const base = this.config.get('PUBLIC_BASE_URL', 'http://localhost:3000');
        const issuer = this.config.get('KEYCLOAK_ISSUER', 'http://localhost:8080/realms/scim');
        const kcBase = issuer.replace(/\/realms\/[^/]+$/, '');
        return {
            scimBase: `${base}/scim/v2`,
            authEndpoint: `${issuer}/protocol/openid-connect/auth`,
            tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
            clientId: this.config.get('DEMO_CLIENT_ID', 'scim-client'),
            clientSecret: this.config.get('DEMO_CLIENT_SECRET', 'scim-client-secret'),
            scope: this.config.get('KEYCLOAK_REQUIRED_SCOPE', 'scim'),
            configGuideUrl: `${base}/demo`,
            keycloakAdmin: `${kcBase}/admin/master/console/`,
            buildId: BUILD_ID,
        };
    }
    page() {
        return (0, demo_page_1.renderDemoPage)(this.demoConfig());
    }
    async users() {
        const [users, totalGroups] = await Promise.all([
            this.prisma.scimUser.findMany({
                orderBy: { createdAt: 'desc' },
                include: { memberships: { include: { group: true } } },
            }),
            this.prisma.scimGroup.count(),
        ]);
        return {
            updatedAt: new Date().toISOString(),
            totalUsers: users.length,
            activeUsers: users.filter((u) => u.active).length,
            totalGroups,
            users: users.map((u) => ({
                id: u.id,
                userName: u.userName,
                givenName: u.givenName,
                familyName: u.familyName,
                email: u.email,
                active: u.active,
                externalId: u.externalId,
                createdAt: u.createdAt,
                updatedAt: u.updatedAt,
                groups: u.memberships.map((m) => m.group.displayName),
            })),
        };
    }
    async clearData() {
        await this.prisma.scimGroupMember.deleteMany();
        await this.prisma.scimUser.deleteMany();
        await this.prisma.scimGroup.deleteMany();
    }
    listEvents() {
        return { events: this.events.list() };
    }
    clearEvents() {
        this.events.clear();
    }
    ingest(req, body) {
        var _a, _b, _c, _d, _e;
        const ip = (_a = req.socket.remoteAddress) !== null && _a !== void 0 ? _a : '';
        if (!ip.includes('127.0.0.1') && !ip.includes('::1')) {
            throw new common_1.ForbiddenException('loopback only');
        }
        this.events.add({
            ts: (_b = body.ts) !== null && _b !== void 0 ? _b : new Date().toISOString(),
            source: (_c = body.source) !== null && _c !== void 0 ? _c : 'okta',
            actor: (_d = body.actor) !== null && _d !== void 0 ? _d : 'unknown',
            kind: (_e = body.kind) !== null && _e !== void 0 ? _e : 'request',
            method: body.method,
            path: body.path,
            status: body.status,
            headers: body.headers,
            payload: body.payload,
        });
    }
};
exports.DemoController = DemoController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], DemoController.prototype, "page", null);
__decorate([
    (0, common_1.Get)('api/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "users", null);
__decorate([
    (0, common_1.Delete)('api/data'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DemoController.prototype, "clearData", null);
__decorate([
    (0, common_1.Get)('api/events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Delete)('api/events'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "clearEvents", null);
__decorate([
    (0, common_1.Post)('internal/events'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], DemoController.prototype, "ingest", null);
exports.DemoController = DemoController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('demo'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_store_1.EventsStore,
        config_1.ConfigService])
], DemoController);
//# sourceMappingURL=demo.controller.js.map