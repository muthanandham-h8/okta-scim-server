import { ScimGroup, ScimGroupMember, ScimUser } from '@prisma/client';
type GroupWithMembers = ScimGroup & {
    members: (ScimGroupMember & {
        user: ScimUser;
    })[];
};
export declare function toScimGroup(group: GroupWithMembers, baseUrl: string): {
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
};
export {};
