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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../../prisma/prisma.service");
let UsersService = class UsersService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async list(filter, pagination) {
        const where = filter && filter.attribute === 'userName' ? { userName: filter.value } : {};
        const [totalResults, users] = await this.prisma.$transaction([
            this.prisma.scimUser.count({ where }),
            this.prisma.scimUser.findMany({
                where,
                orderBy: { createdAt: 'asc' },
                skip: Math.max(pagination.startIndex - 1, 0),
                take: pagination.count,
            }),
        ]);
        return { totalResults, users };
    }
    async findById(id) {
        const user = await this.prisma.scimUser.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`User ${id} not found`);
        return user;
    }
    async create(dto) {
        var _a, _b, _c, _d, _e;
        const existing = await this.prisma.scimUser.findUnique({ where: { userName: dto.userName } });
        if (existing) {
            throw new common_1.ConflictException(`User with userName ${dto.userName} already exists`);
        }
        const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;
        return this.prisma.scimUser.create({
            data: {
                userName: dto.userName,
                externalId: dto.externalId,
                givenName: (_a = dto.name) === null || _a === void 0 ? void 0 : _a.givenName,
                familyName: (_b = dto.name) === null || _b === void 0 ? void 0 : _b.familyName,
                email: (_d = (_c = dto.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value,
                active: (_e = dto.active) !== null && _e !== void 0 ? _e : true,
                passwordHash,
            },
        });
    }
    async replace(id, dto) {
        var _a, _b, _c, _d, _e;
        await this.findById(id);
        const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;
        return this.prisma.scimUser.update({
            where: { id },
            data: Object.assign({ userName: dto.userName, externalId: dto.externalId, givenName: (_a = dto.name) === null || _a === void 0 ? void 0 : _a.givenName, familyName: (_b = dto.name) === null || _b === void 0 ? void 0 : _b.familyName, email: (_d = (_c = dto.emails) === null || _c === void 0 ? void 0 : _c[0]) === null || _d === void 0 ? void 0 : _d.value, active: (_e = dto.active) !== null && _e !== void 0 ? _e : true }, (passwordHash ? { passwordHash } : {})),
        });
    }
    async patch(id, fields) {
        await this.findById(id);
        return this.prisma.scimUser.update({
            where: { id },
            data: fields,
        });
    }
    async remove(id) {
        await this.findById(id);
        await this.prisma.scimUser.delete({ where: { id } });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map