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
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { DemoConfig, renderDemoPage } from './demo.page';
import { DemoEvent, EventsStore } from './events.store';

// Captured once at process start; lets the browser confirm which build it loaded.
const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

/**
 * Presentation-only dashboard for demos. Serves an HTML page (/demo) that polls
 * two JSON feeds reading straight from the database and an in-memory event
 * buffer, so the browser needs no Bearer token. NOT part of the SCIM surface
 * and intentionally unauthenticated — do not expose in a real deployment.
 */
@ApiExcludeController()
@Controller('demo')
export class DemoController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly events: EventsStore,
    private readonly config: ConfigService,
  ) {}

  private demoConfig(): DemoConfig {
    const base = this.config.get<string>('PUBLIC_BASE_URL', 'http://localhost:3000');
    const realm = this.config.get<string>('KEYCLOAK_REALM', 'scim');
    const issuer = this.config.get<string>('KEYCLOAK_ISSUER') || `${base}/realms/${realm}`;
    // Keycloak base (strip the trailing /realms/<realm>) for the admin console link.
    const kcBase = issuer.replace(/\/realms\/[^/]+$/, '');
    return {
      scimBase: `${base}/scim/v2`,
      authEndpoint: `${issuer}/protocol/openid-connect/auth`,
      tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
      clientId: this.config.get<string>('DEMO_CLIENT_ID', 'scim-client'),
      clientSecret: this.config.get<string>('DEMO_CLIENT_SECRET', 'scim-client-secret'),
      scope: this.config.get<string>('KEYCLOAK_REQUIRED_SCOPE', 'scim'),
      configGuideUrl: `${base}/demo`,
      keycloakAdmin: `${kcBase}/admin/master/console/`,
      buildId: BUILD_ID,
    };
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  page(): string {
    return renderDemoPage(this.demoConfig());
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
    // Delete memberships first, then users/groups (FKs also cascade on delete).
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
