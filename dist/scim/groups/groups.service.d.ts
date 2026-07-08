import { PrismaService } from '../../prisma/prisma.service';
import { ParsedFilter, Pagination } from '../common/scim-filter.util';
import { CreateScimGroupDto, UpdateScimGroupDto } from './dto/group.dto';
import { GroupPatchResult } from './apply-group-patch';
export declare class GroupsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    list(filter: ParsedFilter | null, pagination: Pagination): Promise<{
        totalResults: number;
        groups: ({
            members: ({
                user: {
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
                };
            } & {
                id: string;
                userId: string;
                groupId: string;
            })[];
        } & {
            externalId: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            displayName: string;
        })[];
    }>;
    findById(id: string): Promise<{
        members: ({
            user: {
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
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
        })[];
    } & {
        externalId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
    }>;
    create(dto: CreateScimGroupDto): Promise<{
        members: ({
            user: {
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
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
        })[];
    } & {
        externalId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
    }>;
    replace(id: string, dto: UpdateScimGroupDto): Promise<{
        members: ({
            user: {
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
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
        })[];
    } & {
        externalId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
    }>;
    patch(id: string, patch: GroupPatchResult): Promise<{
        members: ({
            user: {
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
            };
        } & {
            id: string;
            userId: string;
            groupId: string;
        })[];
    } & {
        externalId: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        displayName: string;
    }>;
    remove(id: string): Promise<void>;
}
