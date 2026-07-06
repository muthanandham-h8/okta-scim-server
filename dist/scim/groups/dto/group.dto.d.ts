import { PatchOperationDto } from '../../users/dto/user.dto';
export declare class ScimGroupMemberDto {
    value: string;
    display?: string;
}
export declare class CreateScimGroupDto {
    schemas?: string[];
    displayName: string;
    externalId?: string;
    members?: ScimGroupMemberDto[];
}
export declare class UpdateScimGroupDto extends CreateScimGroupDto {
}
export declare class GroupPatchOpDto {
    schemas?: string[];
    Operations: PatchOperationDto[];
}
