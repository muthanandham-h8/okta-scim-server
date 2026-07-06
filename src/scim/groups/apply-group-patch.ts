import { PatchOperationDto } from '../users/dto/user.dto';

export interface GroupPatchResult {
  displayName?: string;
  externalId?: string;
  addMemberIds: string[];
  removeMemberIds: string[];
}

function extractMemberIdFromFilterPath(path: string): string | null {
  // e.g. members[value eq "3fa2c1"]
  const match = path.match(/members\[value eq "([^"]+)"\]/i);
  return match ? match[1] : null;
}

export function applyGroupPatch(operations: PatchOperationDto[]): GroupPatchResult {
  const result: GroupPatchResult = { addMemberIds: [], removeMemberIds: [] };

  for (const operation of operations) {
    const op = operation.op?.toLowerCase();
    const path = operation.path;

    if (op === 'add' && (path === 'members' || !path)) {
      const members = (operation.value as Array<{ value: string }>) ?? [];
      for (const member of members) {
        if (member?.value) result.addMemberIds.push(member.value);
      }
      continue;
    }

    if (op === 'remove') {
      if (path === 'members') {
        const members = (operation.value as Array<{ value: string }>) ?? [];
        for (const member of members) {
          if (member?.value) result.removeMemberIds.push(member.value);
        }
      } else if (path) {
        const id = extractMemberIdFromFilterPath(path);
        if (id) result.removeMemberIds.push(id);
      }
      continue;
    }

    if (op === 'replace') {
      if (path === 'displayName') {
        result.displayName = String(operation.value);
      } else if (!path && operation.value && typeof operation.value === 'object') {
        const value = operation.value as Record<string, unknown>;
        if ('displayName' in value) result.displayName = String(value.displayName);
        if ('externalId' in value) result.externalId = String(value.externalId);
      }
    }
  }

  return result;
}
