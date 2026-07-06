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
import { CreateScimUserDto, PatchOpDto, UpdateScimUserDto } from './dto/user.dto';
import { UsersService } from './users.service';
import { toScimUser } from './users.mapper';
import { applyUserPatch } from './apply-user-patch';

@UseGuards(BearerTokenGuard)
@UseFilters(ScimExceptionFilter)
@Controller('scim/v2/Users')
export class UsersController {
  constructor(
    private readonly users: UsersService,
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
    const { totalResults, users } = await this.users.list(parseEqFilter(filter), pagination);

    return {
      schemas: [SCIM_LIST_RESPONSE_SCHEMA],
      totalResults,
      startIndex: pagination.startIndex,
      itemsPerPage: users.length,
      Resources: users.map((u) => toScimUser(u, this.baseUrl)),
    };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const user = await this.users.findById(id);
    return toScimUser(user, this.baseUrl);
  }

  @Post()
  @HttpCode(201)
  async create(@Body() dto: CreateScimUserDto) {
    const user = await this.users.create(dto);
    return toScimUser(user, this.baseUrl);
  }

  @Put(':id')
  async replace(@Param('id') id: string, @Body() dto: UpdateScimUserDto) {
    const user = await this.users.replace(id, dto);
    return toScimUser(user, this.baseUrl);
  }

  @Patch(':id')
  async patch(@Param('id') id: string, @Body() dto: PatchOpDto) {
    const fields = applyUserPatch(dto.Operations ?? []);
    const user = await this.users.patch(id, fields);
    return toScimUser(user, this.baseUrl);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id') id: string) {
    await this.users.remove(id);
  }
}
