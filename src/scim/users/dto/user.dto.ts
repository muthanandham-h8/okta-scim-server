import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class ScimNameDto {
  @IsOptional()
  @IsString()
  givenName?: string;

  @IsOptional()
  @IsString()
  familyName?: string;
}

export class ScimEmailDto {
  @IsOptional()
  @IsString()
  value?: string;

  @IsOptional()
  @IsBoolean()
  primary?: boolean;

  @IsOptional()
  @IsString()
  type?: string;
}

export class CreateScimUserDto {
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  externalId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => ScimNameDto)
  name?: ScimNameDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ScimEmailDto)
  emails?: ScimEmailDto[];

  @IsOptional()
  @IsBoolean()
  active?: boolean;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateScimUserDto extends CreateScimUserDto {}

export class PatchOperationDto {
  @IsString()
  op: 'add' | 'remove' | 'replace' | string;

  @IsOptional()
  @IsString()
  path?: string;

  @IsOptional()
  value?: unknown;
}

export class PatchOpDto {
  @IsOptional()
  @IsArray()
  schemas?: string[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PatchOperationDto)
  Operations: PatchOperationDto[];
}
