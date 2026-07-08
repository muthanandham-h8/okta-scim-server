import { PrismaService } from '../../prisma/prisma.service';
import { ParsedFilter, Pagination } from '../common/scim-filter.util';
import { CreateScimUserDto, UpdateScimUserDto } from './dto/user.dto';
import { UserPatchFields } from './apply-user-patch';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ParsedFilter | null, pagination: Pagination): Promise<{
        totalResults: number;
        users: {
            givenName: string | null;
            familyName: string | null;
            userName: string;
            externalId: string | null;
            active: boolean;
            id: string;
            email: string | null;
            passwordHash: string | null;
            raw: import("@prisma/client/runtime/library").JsonValue | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    findById(id: string): Promise<{
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        id: string;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    create(dto: CreateScimUserDto): Promise<{
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        id: string;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    replace(id: string, dto: UpdateScimUserDto): Promise<{
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        id: string;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    patch(id: string, fields: UserPatchFields): Promise<{
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        id: string;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
