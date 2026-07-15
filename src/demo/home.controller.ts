import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Header,
  HttpCode,
  Post,
  Req,
} from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { renderHomePage } from './home.page';
import { DemoEvent, EventsStore } from './events.store';

const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

/**
 * Live dashboard at /home: provisioned users + the actor-by-actor traffic log
 * captured by the edge-proxy. Presentation-only and unauthenticated — polls two
 * JSON feeds that read straight from the DB and the in-memory event buffer.
 */
@ApiExcludeController()
@Controller('home')
export class HomeController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsStore,
  ) {}

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  page(): string {
    return renderHomePage({ buildId: BUILD_ID });
  }

  @Get('api/users')
  async users() {
    const [users, totalGroups] = await Promise.all([
      this.prisma.scimUser.findMany({
        orderBy: { createdAt: 'desc' },
        include: { memberships: { include: { group: true } } },
      }),
      this.prisma.scimGroup.count(),
    ]);

    return {
      updatedAt: new Date().toISOString(),
      totalUsers: users.length,
      activeUsers: users.filter((u) => u.active).length,
      totalGroups,
      users: users.map((u) => ({
        id: u.id,
        userName: u.userName,
        givenName: u.givenName,
        familyName: u.familyName,
        email: u.email,
        active: u.active,
        externalId: u.externalId,
        createdAt: u.createdAt,
        updatedAt: u.updatedAt,
        groups: u.memberships.map((m) => m.group.displayName),
      })),
    };
  }

  /** Demo helper: wipe all provisioned users and groups. */
  @Delete('api/data')
  @HttpCode(204)
  async clearData() {
    await this.prisma.scimGroupMember.deleteMany();
    await this.prisma.scimUser.deleteMany();
    await this.prisma.scimGroup.deleteMany();
  }

  @Get('api/events')
  listEvents() {
    return { events: this.events.list() };
  }

  @Delete('api/events')
  @HttpCode(204)
  clearEvents() {
    this.events.clear();
  }

  /** Ingest endpoint for the edge-proxy. Loopback-only to prevent tampering. */
  @Post('internal/events')
  @HttpCode(204)
  ingest(@Req() req: Request, @Body() body: Partial<DemoEvent>) {
    const ip = req.socket.remoteAddress ?? '';
    if (!ip.includes('127.0.0.1') && !ip.includes('::1')) {
      throw new ForbiddenException('loopback only');
    }
    this.events.add({
      ts: body.ts ?? new Date().toISOString(),
      source: body.source ?? 'okta',
      actor: body.actor ?? 'unknown',
      kind: body.kind ?? 'request',
      method: body.method,
      path: body.path,
      status: body.status,
      headers: body.headers,
      payload: body.payload,
    });
  }
}
