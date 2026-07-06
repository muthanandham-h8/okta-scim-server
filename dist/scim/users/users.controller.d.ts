import { ConfigService } from '@nestjs/config';
import { CreateScimUserDto, PatchOpDto, UpdateScimUserDto } from './dto/user.dto';
import { UsersService } from './users.service';
export declare class UsersController {
    private readonly users;
    private readonly config;
    constructor(users: UsersService, config: ConfigService);
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
            userName: string;
            name: {
                givenName: string;
                familyName: string;
            };
            emails: {
                value: string;
                primary: boolean;
            }[];
            active: boolean;
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
        userName: string;
        name: {
            givenName: string;
            familyName: string;
        };
        emails: {
            value: string;
            primary: boolean;
        }[];
        active: boolean;
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    create(dto: CreateScimUserDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        userName: string;
        name: {
            givenName: string;
            familyName: string;
        };
        emails: {
            value: string;
            primary: boolean;
        }[];
        active: boolean;
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    replace(id: string, dto: UpdateScimUserDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        userName: string;
        name: {
            givenName: string;
            familyName: string;
        };
        emails: {
            value: string;
            primary: boolean;
        }[];
        active: boolean;
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    patch(id: string, dto: PatchOpDto): Promise<{
        schemas: string[];
        id: string;
        externalId: string;
        userName: string;
        name: {
            givenName: string;
            familyName: string;
        };
        emails: {
            value: string;
            primary: boolean;
        }[];
        active: boolean;
        meta: {
            resourceType: string;
            created: string;
            lastModified: string;
            location: string;
        };
    }>;
    remove(id: string): Promise<void>;
}
