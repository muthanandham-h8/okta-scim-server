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
import { BearerTokenGuard } from '../../oauth/bearer-token.guard';
import { ScimExceptionFilter } from '../common/scim-exception.filter';
import { SCIM_LIST_RESPONSE_SCHEMA } from '../common/scim.constants';
import { parseEqFilter, parsePagination } from '../common/scim-filter.util';
import { CreateScimGroupDto, GroupPatchOpDto, UpdateScimGroupDto } from './dto/group.dto';
import { GroupsService } from './groups.service';
import { toScimGroup } from './groups.mapper';
import { applyGroupPatch } from './apply-group-patch';

@UseGuards(BearerTokenGuard)
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

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const group = await this.groups.findById(id);
    return toScimGroup(group, this.baseUrl);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateScimGroupDto) {
    const group = await this.groups.create(dto);
    return toScimGroup(group, this.baseUrl);
  }

  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: UpdateScimGroupDto) {
    const group = await this.groups.replace(id, dto);
    return toScimGroup(group, this.baseUrl);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: GroupPatchOpDto) {
    const patchResult = applyGroupPatch(dto.Operations ?? []);
    const group = await this.groups.patch(id, patchResult);
    return toScimGroup(group, this.baseUrl);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.groups.remove(id);
  }
}
