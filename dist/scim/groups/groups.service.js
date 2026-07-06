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
exports.GroupsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma/prisma.service");
const WITH_MEMBERS = { members: { include: { user: true } } };
let GroupsService = class GroupsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter, pagination) {
        const where = filter && filter.attribute === 'displayName' ? { displayName: filter.value } : {};
        const [totalResults, groups] = await this.prisma.$transaction([
            this.prisma.scimGroup.count({ where }),
            this.prisma.scimGroup.findMany({
                where,
                orderBy: { createdAt: 'asc' },
                skip: Math.max(pagination.startIndex - 1, 0),
                take: pagination.count,
                include: WITH_MEMBERS,
            }),
        ]);
        return { totalResults, groups };
    }
    async findById(id) {
        const group = await this.prisma.scimGroup.findUnique({ where: { id }, include: WITH_MEMBERS });
        if (!group)
            throw new common_1.NotFoundException(`Group ${id} not found`);
        return group;
    }
    async create(dto) {
        var _a;
        const existing = await this.prisma.scimGroup.findUnique({ where: { displayName: dto.displayName } });
        if (existing) {
            throw new common_1.ConflictException(`Group with displayName ${dto.displayName} already exists`);
        }
        const group = await this.prisma.scimGroup.create({
            data: {
                displayName: dto.displayName,
                externalId: dto.externalId,
                members: {
                    create: ((_a = dto.members) !== null && _a !== void 0 ? _a : []).map((m) => ({ userId: m.value })),
                },
            },
            include: WITH_MEMBERS,
        });
        return group;
    }
    async replace(id, dto) {
        var _a;
        await this.findById(id);
        await this.prisma.$transaction([
            this.prisma.scimGroupMember.deleteMany({ where: { groupId: id } }),
            this.prisma.scimGroup.update({
                where: { id },
                data: {
                    displayName: dto.displayName,
                    externalId: dto.externalId,
                    members: {
                        create: ((_a = dto.members) !== null && _a !== void 0 ? _a : []).map((m) => ({ userId: m.value })),
                    },
                },
            }),
        ]);
        return this.findById(id);
    }
    async patch(id, patch) {
        await this.findById(id);
        const operations = [];
        if (patch.displayName !== undefined || patch.externalId !== undefined) {
            operations.push(this.prisma.scimGroup.update({
                where: { id },
                data: Object.assign(Object.assign({}, (patch.displayName !== undefined ? { displayName: patch.displayName } : {})), (patch.externalId !== undefined ? { externalId: patch.externalId } : {})),
            }));
        }
        for (const userId of patch.removeMemberIds) {
            operations.push(this.prisma.scimGroupMember.deleteMany({ where: { groupId: id, userId } }));
        }
        for (const userId of patch.addMemberIds) {
            operations.push(this.prisma.scimGroupMember.upsert({
                where: { groupId_userId: { groupId: id, userId } },
                create: { groupId: id, userId },
                update: {},
            }));
        }
        if (operations.length > 0) {
            await this.prisma.$transaction(operations);
        }
        return this.findById(id);
    }
    async remove(id) {
        await this.findById(id);
        await this.prisma.scimGroup.delete({ where: { id } });
    }
};
exports.GroupsService = GroupsService;
exports.GroupsService = GroupsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], GroupsService);
//# sourceMappingURL=groups.service.js.map