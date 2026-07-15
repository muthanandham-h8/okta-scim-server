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
exports.HomeController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prisma_service_1 = require("../prisma/prisma.service");
const home_page_1 = require("./home.page");
const events_store_1 = require("./events.store");
const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';
let HomeController = class HomeController {
    constructor(prisma, events) {
        this.prisma = prisma;
        this.events = events;
    }
    page() {
        return (0, home_page_1.renderHomePage)({ buildId: BUILD_ID });
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
exports.HomeController = HomeController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', 'text/html; charset=utf-8'),
    (0, common_1.Header)('Cache-Control', 'no-store'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", String)
], HomeController.prototype, "page", null);
__decorate([
    (0, common_1.Get)('api/users'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "users", null);
__decorate([
    (0, common_1.Delete)('api/data'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], HomeController.prototype, "clearData", null);
__decorate([
    (0, common_1.Get)('api/events'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "listEvents", null);
__decorate([
    (0, common_1.Delete)('api/events'),
    (0, common_1.HttpCode)(204),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "clearEvents", null);
__decorate([
    (0, common_1.Post)('internal/events'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], HomeController.prototype, "ingest", null);
exports.HomeController = HomeController = __decorate([
    (0, swagger_1.ApiExcludeController)(),
    (0, common_1.Controller)('home'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        events_store_1.EventsStore])
], HomeController);
//# sourceMappingURL=home.controller.js.map