import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ScimNameDto {
  @ApiPropertyOptional({ example: 'Jane' })
  @IsOptional()
  @IsString()
  givenName?: string;

  @ApiPropertyOptional({ example: 'Doe' })
  @IsOptional()
  @IsString()
  familyName?: string;
}

export class ScimEmailDto {
  @ApiPropertyOptional({ example: 'jane.doe@example.com' })
  @IsOptional()
  @IsString()
  value?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  primary?: boolean;

  @ApiPropertyOptional({ example: 'work' })
  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateScimUserDto {
  @ApiPropertyOptional({ example: ['urn:ietf:params:scim:schemas:core:2.0:User'] })
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @ApiProperty({ example: 'jane.doe@example.com' })
  @IsString()
  userName: string;

  @ApiPropertyOptional({ description: 'Okta-side stable identifier' })
  @IsOptional()
  @IsString()
  externalId?: string;

  @ApiPropertyOptional({ type: ScimNameDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ScimNameDto)
  name?: ScimNameDto;

  @ApiPropertyOptional({ type: [ScimEmailDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScimEmailDto)
  emails?: ScimEmailDto[];

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @ApiPropertyOptional({ description: 'Optional initial password' })
  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateScimUserDto extends CreateScimUserDto {}

export class PatchOperationDto {
  @ApiProperty({ example: 'replace', enum: ['add', 'remove', 'replace'] })
  @IsString()
  op: 'add' | 'remove' | 'replace' | string;

  @ApiPropertyOptional({ example: 'active' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({
    description: 'Scalar, object, or array depending on op/path',
    example: false,
  })
  @IsOptional()
  value?: unknown;
}

export class PatchOpDto {
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
