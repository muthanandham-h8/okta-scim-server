import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ParsedFilter, Pagination } from '../common/scim-filter.util';
import { CreateScimGroupDto, UpdateScimGroupDto } from './dto/group.dto';
import { GroupPatchResult } from './apply-group-patch';

const WITH_MEMBERS = { members: { include: { user: true } } } as const;

@Injectable()
export class GroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ParsedFilter | null, pagination: Pagination) {
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

  async findById(id: string) {
    const group = await this.prisma.scimGroup.findUnique({ where: { id }, include: WITH_MEMBERS });
    if (!group) throw new NotFoundException(`Group ${id} not found`);
    return group;
  }

  async create(dto: CreateScimGroupDto) {
    const existing = await this.prisma.scimGroup.findUnique({ where: { displayName: dto.displayName } });
    if (existing) {
      throw new ConflictException(`Group with displayName ${dto.displayName} already exists`);
    }

    const group = await this.prisma.scimGroup.create({
      data: {
        displayName: dto.displayName,
        externalId: dto.externalId,
        members: {
          create: (dto.members ?? []).map((m) => ({ userId: m.value })),
        },
      },
      include: WITH_MEMBERS,
    });

    return group;
  }

  async replace(id: string, dto: UpdateScimGroupDto) {
    await this.findById(id);

    await this.prisma.$transaction([
      this.prisma.scimGroupMember.deleteMany({ where: { groupId: id } }),
      this.prisma.scimGroup.update({
        where: { id },
        data: {
          displayName: dto.displayName,
          externalId: dto.externalId,
          members: {
            create: (dto.members ?? []).map((m) => ({ userId: m.value })),
          },
        },
      }),
    ]);

    return this.findById(id);
  }

  async patch(id: string, patch: GroupPatchResult) {
    await this.findById(id);

    const operations = [];

    if (patch.displayName !== undefined || patch.externalId !== undefined) {
      operations.push(
        this.prisma.scimGroup.update({
          where: { id },
          data: {
            ...(patch.displayName !== undefined ? { displayName: patch.displayName } : {}),
            ...(patch.externalId !== undefined ? { externalId: patch.externalId } : {}),
          },
        }),
      );
    }

    for (const userId of patch.removeMemberIds) {
      operations.push(
        this.prisma.scimGroupMember.deleteMany({ where: { groupId: id, userId } }),
      );
    }

    for (const userId of patch.addMemberIds) {
      operations.push(
        this.prisma.scimGroupMember.upsert({
          where: { groupId_userId: { groupId: id, userId } },
          create: { groupId: id, userId },
          update: {},
        }),
      );
    }

    if (operations.length > 0) {
      await this.prisma.$transaction(operations);
    }

    return this.findById(id);
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.scimGroup.delete({ where: { id } });
  }
}
