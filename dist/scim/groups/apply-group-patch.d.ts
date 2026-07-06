import { PatchOperationDto } from '../users/dto/user.dto';
export interface GroupPatchResult {
    displayName?: string;
    externalId?: string;
    addMemberIds: string[];
    removeMemberIds: string[];
}
export declare function applyGroupPatch(operations: PatchOperationDto[]): GroupPatchResult;
