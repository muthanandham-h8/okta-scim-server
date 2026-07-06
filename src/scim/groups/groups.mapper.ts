import { ScimGroup, ScimGroupMember, ScimUser } from '@prisma/client';
import { SCIM_GROUP_SCHEMA } from '../common/scim.constants';

type GroupWithMembers = ScimGroup & { members: (ScimGroupMember & { user: ScimUser })[] };

export function toScimGroup(group: GroupWithMembers, baseUrl: string) {
  return {
    schemas: [SCIM_GROUP_SCHEMA],
    id: group.id,
    externalId: group.externalId ?? undefined,
    displayName: group.displayName,
    members: group.members.map((m) => ({
      value: m.user.id,
      display: m.user.userName,
    })),
    meta: {
      resourceType: 'Group',
      created: group.createdAt.toISOString(),
      lastModified: group.updatedAt.toISOString(),
      location: `${baseUrl}/scim/v2/Groups/${group.id}`,
    },
  };
}
