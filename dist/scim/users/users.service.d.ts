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
            id: string;
            createdAt: Date;
            givenName: string | null;
            familyName: string | null;
            userName: string;
            externalId: string | null;
            active: boolean;
            email: string | null;
            passwordHash: string | null;
            raw: import("@prisma/client/runtime/library").JsonValue | null;
            updatedAt: Date;
        }[];
    }>;
    findById(id: string): Promise<{
        id: string;
        createdAt: Date;
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    create(dto: CreateScimUserDto): Promise<{
        id: string;
        createdAt: Date;
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    replace(id: string, dto: UpdateScimUserDto): Promise<{
        id: string;
        createdAt: Date;
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    patch(id: string, fields: UserPatchFields): Promise<{
        id: string;
        createdAt: Date;
        givenName: string | null;
        familyName: string | null;
        userName: string;
        externalId: string | null;
        active: boolean;
        email: string | null;
        passwordHash: string | null;
        raw: import("@prisma/client/runtime/library").JsonValue | null;
        updatedAt: Date;
    }>;
    remove(id: string): Promise<void>;
}
