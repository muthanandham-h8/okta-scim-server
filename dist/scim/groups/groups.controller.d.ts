import { ConfigService } from '@nestjs/config';
import { CreateScimGroupDto, GroupPatchOpDto, UpdateScimGroupDto } from './dto/group.dto';
import { GroupsService } from './groups.service';
export declare class GroupsController {
    private readonly groups;
    private readonly config;
    constructor(groups: GroupsService, config: ConfigService);
    private get baseUrl();
    list(filter?: string, startIndex?: string, count?: string): Promise<{
        schemas: string[];
        totalResults: number;
        startIndex: number;
        itemsPerPage: number;
        Resources: {
            schemas: string[];
            id: string;
            externalId: string;
            displayName: string;
            members: {
                value: string;
                display: string;
            }[];
            meta: {
                resourceType: string;
                created: string;
                lastModified: string;
                location: string;
            };
        }[];
    }>;
    findOne(id: string): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        displayName: string;
        members: {
            value: string;
            display: string;
        }[];
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    create(dto: CreateScimGroupDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        displayName: string;
        members: {
            value: string;
            display: string;
        }[];
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    replace(id: string, dto: UpdateScimGroupDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        displayName: string;
        members: {
            value: string;
            display: string;
        }[];
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    patch(id: string, dto: GroupPatchOpDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        displayName: string;
        members: {
            value: string;
            display: string;
        }[];
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    remove(id: string): Promise<void>;
}
