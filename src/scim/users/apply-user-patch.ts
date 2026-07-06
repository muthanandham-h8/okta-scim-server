import { PatchOperationDto } from './dto/user.dto';

export interface UserPatchFields {
  active?: boolean;
  userName?: string;
  givenName?: string;
  familyName?: string;
  email?: string;
  externalId?: string;
}

function applyValueForPath(fields: UserPatchFields, path: string, value: unknown): void {
  switch (path) {
    case 'active':
      fields.active = Boolean(value);
      break;
    case 'userName':
      fields.userName = String(value);
      break;
    case 'name.givenName':
      fields.givenName = String(value);
      break;
    case 'name.familyName':
      fields.familyName = String(value);
      break;
    case 'externalId':
      fields.externalId = String(value);
      break;
    case 'emails':
    case 'emails[primary eq true].value':
      if (Array.isArray(value) && value.length > 0) {
        fields.email = String((value[0] as { value?: string }).value ?? value[0]);
      } else if (typeof value === 'string') {
        fields.email = value;
      }
      break;
    default:
      // Unsupported / vendor-specific paths are ignored rather than rejected,
      // since Okta may send extension attributes this server doesn't track.
      break;
  }
}

function applyValueObject(fields: UserPatchFields, value: Record<string, unknown>): void {
  if ('active' in value) fields.active = Boolean(value.active);
  if ('userName' in value) fields.userName = String(value.userName);
  if ('externalId' in value) fields.externalId = String(value.externalId);
  const name = value.name as { givenName?: string; familyName?: string } | undefined;
  if (name?.givenName !== undefined) fields.givenName = name.givenName;
  if (name?.familyName !== undefined) fields.familyName = name.familyName;
  const emails = value.emails as Array<{ value?: string }> | undefined;
  if (Array.isArray(emails) && emails.length > 0) {
    fields.email = emails[0].value;
  }
}

export function applyUserPatch(operations: PatchOperationDto[]): UserPatchFields {
  const fields: UserPatchFields = {};

  for (const operation of operations) {
    const op = operation.op?.toLowerCase();
    if (op !== 'replace' && op !== 'add') continue;

    if (operation.path) {
      applyValueForPath(fields, operation.path, operation.value);
    } else if (operation.value && typeof operation.value === 'object') {
      applyValueObject(fields, operation.value as Record<string, unknown>);
    }
  }

  return fields;
}
