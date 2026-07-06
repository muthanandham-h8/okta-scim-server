import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PatchOperationDto } from '../../users/dto/user.dto';

export class ScimGroupMemberDto {
  @IsString()
  value: string;

  @IsOptional()
  @IsString()
  display?: string;
}

export class CreateScimGroupDto {
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @IsString()
  displayName: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScimGroupMemberDto)
  members?: ScimGroupMemberDto[];
}

export class UpdateScimGroupDto extends CreateScimGroupDto {}

export class GroupPatchOpDto {
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchOperationDto)
  Operations: PatchOperationDto[];
}
