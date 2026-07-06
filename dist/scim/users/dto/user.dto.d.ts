export declare class ScimNameDto {
    givenName?: string;
    familyName?: string;
}
export declare class ScimEmailDto {
    value?: string;
    primary?: boolean;
    type?: string;
}
export declare class CreateScimUserDto {
    schemas?: string[];
    userName: string;
    externalId?: string;
    name?: ScimNameDto;
    emails?: ScimEmailDto[];
    active?: boolean;
    password?: string;
}
export declare class UpdateScimUserDto extends CreateScimUserDto {
}
export declare class PatchOperationDto {
    op: 'add' | 'remove' | 'replace' | string;
    path?: string;
    value?: unknown;
}
export declare class PatchOpDto {
    schemas?: string[];
    Operations: PatchOperationDto[];
}
