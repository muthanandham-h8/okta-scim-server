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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const bearer_token_guard_1 = require("../../oauth/bearer-token.guard");
const scim_exception_filter_1 = require("../common/scim-exception.filter");
const scim_constants_1 = require("../common/scim.constants");
const scim_filter_util_1 = require("../common/scim-filter.util");
const user_dto_1 = require("./dto/user.dto");
const users_service_1 = require("./users.service");
const users_mapper_1 = require("./users.mapper");
const apply_user_patch_1 = require("./apply-user-patch");
let UsersController = class UsersController {
    constructor(users, config) {
        this.users = users;
        this.config = config;
    }
    get baseUrl() {
        return this.config.get('PUBLIC_BASE_URL', 'http://localhost:3000');
    }
    async list(filter, startIndex, count) {
        const pagination = (0, scim_filter_util_1.parsePagination)(startIndex, count);
        const { totalResults, users } = await this.users.list((0, scim_filter_util_1.parseEqFilter)(filter), pagination);
        return {
            schemas: [scim_constants_1.SCIM_LIST_RESPONSE_SCHEMA],
            totalResults,
            startIndex: pagination.startIndex,
            itemsPerPage: users.length,
            Resources: users.map((u) => (0, users_mapper_1.toScimUser)(u, this.baseUrl)),
        };
    }
    async findOne(id) {
        const user = await this.users.findById(id);
        return (0, users_mapper_1.toScimUser)(user, this.baseUrl);
    }
    async create(dto) {
        const user = await this.users.create(dto);
        return (0, users_mapper_1.toScimUser)(user, this.baseUrl);
    }
    async replace(id, dto) {
        const user = await this.users.replace(id, dto);
        return (0, users_mapper_1.toScimUser)(user, this.baseUrl);
    }
    async patch(id, dto) {
        var _a;
        const fields = (0, apply_user_patch_1.applyUserPatch)((_a = dto.Operations) !== null && _a !== void 0 ? _a : []);
        const user = await this.users.patch(id, fields);
        return (0, users_mapper_1.toScimUser)(user, this.baseUrl);
    }
    async remove(id) {
        await this.users.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('startIndex')),
    __param(2, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [user_dto_1.CreateScimUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.UpdateScimUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "replace", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, user_dto_1.PatchOpDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "patch", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.UseGuards)(bearer_token_guard_1.BearerTokenGuard),
    (0, common_1.UseFilters)(scim_exception_filter_1.ScimExceptionFilter),
    (0, common_1.Controller)('scim/v2/Users'),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        config_1.ConfigService])
], UsersController);
//# sourceMappingURL=users.controller.js.map