import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UseFilters,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { ScimExceptionFilter } from '../common/scim-exception.filter';
import { SCIM_LIST_RESPONSE_SCHEMA } from '../common/scim.constants';
import { parseEqFilter, parsePagination } from '../common/scim-filter.util';
import { CreateScimGroupDto, GroupPatchOpDto, UpdateScimGroupDto } from './dto/group.dto';
import { GroupsService } from './groups.service';
import { toScimGroup } from './groups.mapper';
import { applyGroupPatch } from './apply-group-patch';

@ApiTags('SCIM Groups')
@ApiBearerAuth('keycloak-jwt')
@UseGuards(JwtAuthGuard)
@UseFilters(ScimExceptionFilter)
@Controller('scim/v2/Groups')
export class GroupsController {
  constructor(
    private readonly groups: GroupsService,
    private readonly config: ConfigService,
  ) {}

  private get baseUrl(): string {
    return this.config.get<string>('PUBLIC_BASE_URL', 'http://localhost:3000');
  }

  @ApiOperation({ summary: 'List groups (supports `displayName eq "..."` filter + pagination)' })
  @ApiQuery({ name: 'filter', required: false, example: 'displayName eq "Engineering"' })
  @ApiQuery({ name: 'startIndex', required: false, example: '1' })
  @ApiQuery({ name: 'count', required: false, example: '100' })
  @Get()
  async list(
    @Query('filter') filter?: string,
    @Query('startIndex') startIndex?: string,
    @Query('count') count?: string,
  ) {
    const pagination = parsePagination(startIndex, count);
    const { totalResults, groups } = await this.groups.list(parseEqFilter(filter), pagination);

    return {
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      totalResults,
      startIndex: pagination.startIndex,
      itemsPerPage: groups.length,
      Resources: groups.map((g) => toScimGroup(g, this.baseUrl)),
    };
  }

  @ApiOperation({ summary: 'Get a single group by id' })
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const group = await this.groups.findById(id);
    return toScimGroup(group, this.baseUrl);
  }

  @ApiOperation({ summary: 'Create a group' })
  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateScimGroupDto) {
    const group = await this.groups.create(dto);
    return toScimGroup(group, this.baseUrl);
  }

  @ApiOperation({ summary: 'Replace a group (full PUT)' })
  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: UpdateScimGroupDto) {
    const group = await this.groups.replace(id, dto);
    return toScimGroup(group, this.baseUrl);
  }

  @ApiOperation({ summary: 'Patch a group (Okta sends add/remove on members)' })
  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: GroupPatchOpDto) {
    const patchResult = applyGroupPatch(dto.Operations ?? []);
    const group = await this.groups.patch(id, patchResult);
    return toScimGroup(group, this.baseUrl);
  }

  @ApiOperation({ summary: 'Delete a group' })
  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.groups.remove(id);
  }
}
