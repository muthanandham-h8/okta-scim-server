import { ScimUser } from '@prisma/client';
import { SCIM_USER_SCHEMA } from '../common/scim.constants';

export function toScimUser(user: ScimUser, baseUrl: string) {
  return {
    schemas: [SCIM_USER_SCHEMA],
    id: user.id,
    externalId: user.externalId ?? undefined,
    userName: user.userName,
    name: {
      givenName: user.givenName ?? undefined,
      familyName: user.familyName ?? undefined,
    },
    emails: user.email ? [{ value: user.email, primary: true }] : [],
    active: user.active,
    meta: {
      resourceType: 'User',
      created: user.createdAt.toISOString(),
      lastModified: user.updatedAt.toISOString(),
      location: `${baseUrl}/scim/v2/Users/${user.id}`,
    },
  };
}
