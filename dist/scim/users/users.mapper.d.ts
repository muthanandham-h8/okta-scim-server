import { ScimUser } from '@prisma/client';
export declare function toScimUser(user: ScimUser, baseUrl: string): {
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
};
