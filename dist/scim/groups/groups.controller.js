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
exports.GroupsController = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../../auth/jwt-auth.guard");
const scim_exception_filter_1 = require("../common/scim-exception.filter");
const scim_constants_1 = require("../common/scim.constants");
const scim_filter_util_1 = require("../common/scim-filter.util");
const group_dto_1 = require("./dto/group.dto");
const groups_service_1 = require("./groups.service");
const groups_mapper_1 = require("./groups.mapper");
const apply_group_patch_1 = require("./apply-group-patch");
let GroupsController = class GroupsController {
    constructor(groups, config) {
        this.groups = groups;
        this.config = config;
    }
    get baseUrl() {
        return this.config.get('PUBLIC_BASE_URL', 'http://localhost:3000');
    }
    async list(filter, startIndex, count) {
        const pagination = (0, scim_filter_util_1.parsePagination)(startIndex, count);
        const { totalResults, groups } = await this.groups.list((0, scim_filter_util_1.parseEqFilter)(filter), pagination);
        return {
            schemas: [scim_constants_1.SCIM_LIST_RESPONSE_SCHEMA],
            totalResults,
            startIndex: pagination.startIndex,
            itemsPerPage: groups.length,
            Resources: groups.map((g) => (0, groups_mapper_1.toScimGroup)(g, this.baseUrl)),
        };
    }
    async findOne(id) {
        const group = await this.groups.findById(id);
        return (0, groups_mapper_1.toScimGroup)(group, this.baseUrl);
    }
    async create(dto) {
        const group = await this.groups.create(dto);
        return (0, groups_mapper_1.toScimGroup)(group, this.baseUrl);
    }
    async replace(id, dto) {
        const group = await this.groups.replace(id, dto);
        return (0, groups_mapper_1.toScimGroup)(group, this.baseUrl);
    }
    async patch(id, dto) {
        var _a;
        const patchResult = (0, apply_group_patch_1.applyGroupPatch)((_a = dto.Operations) !== null && _a !== void 0 ? _a : []);
        const group = await this.groups.patch(id, patchResult);
        return (0, groups_mapper_1.toScimGroup)(group, this.baseUrl);
    }
    async remove(id) {
        await this.groups.remove(id);
    }
};
exports.GroupsController = GroupsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List groups (supports `displayName eq "..."` filter + pagination)' }),
    (0, swagger_1.ApiQuery)({ name: 'filter', required: false, example: 'displayName eq "Engineering"' }),
    (0, swagger_1.ApiQuery)({ name: 'startIndex', required: false, example: '1' }),
    (0, swagger_1.ApiQuery)({ name: 'count', required: false, example: '100' }),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('filter')),
    __param(1, (0, common_1.Query)('startIndex')),
    __param(2, (0, common_1.Query)('count')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a single group by id' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "findOne", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Create a group' }),
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(201),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [group_dto_1.CreateScimGroupDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Replace a group (full PUT)' }),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, group_dto_1.UpdateScimGroupDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "replace", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Patch a group (Okta sends add/remove on members)' }),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, group_dto_1.GroupPatchOpDto]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "patch", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Delete a group' }),
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(204),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], GroupsController.prototype, "remove", null);
exports.GroupsController = GroupsController = __decorate([
    (0, swagger_1.ApiTags)('SCIM Groups'),
    (0, swagger_1.ApiBearerAuth)('keycloak-jwt'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, common_1.UseFilters)(scim_exception_filter_1.ScimExceptionFilter),
    (0, common_1.Controller)('scim/v2/Groups'),
    __metadata("design:paramtypes", [groups_service_1.GroupsService,
        config_1.ConfigService])
], GroupsController);
//# sourceMappingURL=groups.controller.js.map