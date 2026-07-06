import { PatchOperationDto } from './dto/user.dto';
export interface UserPatchFields {
    active?: boolean;
    userName?: string;
    givenName?: string;
    familyName?: string;
    email?: string;
    externalId?: string;
}
export declare function applyUserPatch(operations: PatchOperationDto[]): UserPatchFields;
