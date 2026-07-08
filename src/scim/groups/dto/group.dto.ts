import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PatchOperationDto } from '../../users/dto/user.dto';

export class ScimGroupMemberDto {
  @ApiProperty({ description: 'SCIM user id of the member', example: 'cce06042-d39e-43b5-869b-c00d26231d35' })
  @IsString()
  value: string;

  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @IsOptional()
  @IsString()
  display?: string;
}

export class CreateScimGroupDto {
  @ApiPropertyOptional({ example: ['urn:ietf:params:scim:schemas:core:2.0:Group'] })
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @ApiProperty({ example: 'Engineering' })
  @IsString()
  displayName: string;

  @ApiPropertyOptional({ description: 'Okta-side stable identifier' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ type: [ScimGroupMemberDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScimGroupMemberDto)
  members?: ScimGroupMemberDto[];
}

export class UpdateScimGroupDto extends CreateScimGroupDto {}

export class GroupPatchOpDto {
  @ApiPropertyOptional({ example: ['urn:ietf:params:scim:api:messages:2.0:PatchOp'] })
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @ApiProperty({ type: [PatchOperationDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchOperationDto)
  Operations: PatchOperationDto[];
}
