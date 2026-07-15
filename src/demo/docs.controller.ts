import { Controller, Get, Header, Param, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import {
  DocsConfig,
  METHOD_SLUGS,
  renderDocsIndex,
  renderMethodPage,
} from './docs.page';

const BUILD_ID = new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC';

/**
 * Documentation at /docs (index) and /docs/:method (per-method runbooks).
 * Presentation-only; the SCIM API lives at /scim/v2 and the live dashboard at
 * /home. Swagger moved to /swagger.
 */
@ApiExcludeController()
@Controller('docs')
export class DocsController {
  constructor(private readonly config: ConfigService) {}

  private cfg(): DocsConfig {
    const base = this.config.get<string>('PUBLIC_BASE_URL', 'http://localhost:3000');
    const realm = this.config.get<string>('KEYCLOAK_REALM', 'scim');
    const issuer = this.config.get<string>('KEYCLOAK_ISSUER') || `${base}/realms/${realm}`;
    return {
      scimBase: `${base}/scim/v2`,
      tokenEndpoint: `${issuer}/protocol/openid-connect/token`,
      authEndpoint: `${issuer}/protocol/openid-connect/auth`,
      clientId: 'okta-provisioning',
      // Dedicated client's secret (matches keycloak/realm-scim.json).
      clientSecret: '7Qhq86B8mibREt7hoTcjBzSEO2NvMJlb',
      scope: this.config.get<string>('KEYCLOAK_REQUIRED_SCOPE', 'scim'),
      buildId: BUILD_ID,
    };
  }

  @Get()
  @Header('Content-Type', 'text/html; charset=utf-8')
  @Header('Cache-Control', 'no-store')
  index(): string {
    return renderDocsIndex(this.cfg());
  }

  @Get(':method')
  method(@Param('method') method: string, @Res() res: Response): void {
    const slug = METHOD_SLUGS.find((s) => s === method);
    if (!slug) {
      res.redirect(302, '/docs');
      return;
    }
    res
      .type('text/html; charset=utf-8')
      .set('Cache-Control', 'no-store')
      .send(renderMethodPage(slug, this.cfg()));
  }
}
