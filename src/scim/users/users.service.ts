import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../prisma/prisma.service';
import { ParsedFilter, Pagination } from '../common/scim-filter.util';
import { CreateScimUserDto, UpdateScimUserDto } from './dto/user.dto';
import { UserPatchFields } from './apply-user-patch';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(filter: ParsedFilter | null, pagination: Pagination) {
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

  async findById(id: string) {
    const user = await this.prisma.scimUser.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }

  async create(dto: CreateScimUserDto) {
    const existing = await this.prisma.scimUser.findUnique({ where: { userName: dto.userName } });
    if (existing) {
      throw new ConflictException(`User with userName ${dto.userName} already exists`);
    }

    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : null;

    return this.prisma.scimUser.create({
      data: {
        userName: dto.userName,
        externalId: dto.externalId,
        givenName: dto.name?.givenName,
        familyName: dto.name?.familyName,
        email: dto.emails?.[0]?.value,
        active: dto.active ?? true,
        passwordHash,
      },
    });
  }

  async replace(id: string, dto: UpdateScimUserDto) {
    await this.findById(id);
    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    return this.prisma.scimUser.update({
      where: { id },
      data: {
        userName: dto.userName,
        externalId: dto.externalId,
        givenName: dto.name?.givenName,
        familyName: dto.name?.familyName,
        email: dto.emails?.[0]?.value,
        active: dto.active ?? true,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });
  }

  async patch(id: string, fields: UserPatchFields) {
    await this.findById(id);
    return this.prisma.scimUser.update({
      where: { id },
      data: fields,
    });
  }

  async remove(id: string) {
    await this.findById(id);
    await this.prisma.scimUser.delete({ where: { id } });
  }
}
