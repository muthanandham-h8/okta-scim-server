import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  Post,
  Query,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { OAuthService } from './oauth.service';

function parseBasicAuth(header?: string): { clientId: string; clientSecret: string } | null {
  if (!header || !header.startsWith('Basic ')) return null;
  const decoded = Buffer.from(header.slice(6), 'base64').toString('utf8');
  const idx = decoded.indexOf(':');
  if (idx === -1) return null;
  return { clientId: decoded.slice(0, idx), clientSecret: decoded.slice(idx + 1) };
}

@Controller('oauth')
export class OAuthController {
  constructor(
    private readonly oauth: OAuthService,
    private readonly config: ConfigService,
  ) {}

  // Step 1: Okta's browser redirect lands here to obtain an authorization code.
  @Get('authorize')
  async authorize(
    @Query('response_type') responseType: string,
    @Query('client_id') clientId: string,
    @Query('redirect_uri') redirectUri: string,
    @Query('scope') scope: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    if (responseType !== 'code') {
      throw new BadRequestException('unsupported_response_type');
    }
    const client = await this.oauth.findClientById(clientId);
    if (!client) {
      throw new BadRequestException('invalid_client');
    }
    this.oauth.validateRedirectUri(client, redirectUri);

    res.type('html').send(renderLoginPage({ clientId, redirectUri, scope, state, error: null }));
  }

  // Step 2: admin submits credentials to approve the grant; we mint a code and
  // redirect back to Okta's callback URL exactly like a normal auth-code flow.
  @Post('authorize')
  async approve(
    @Body('client_id') clientId: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('scope') scope: string,
    @Body('state') state: string,
    @Body('username') username: string,
    @Body('password') password: string,
    @Res() res: Response,
  ) {
    const client = await this.oauth.findClientById(clientId);
    if (!client) {
      throw new BadRequestException('invalid_client');
    }
    this.oauth.validateRedirectUri(client, redirectUri);

    const adminUser = this.config.get<string>('ADMIN_USERNAME');
    const adminPass = this.config.get<string>('ADMIN_PASSWORD');
    if (username !== adminUser || password !== adminPass) {
      res
        .type('html')
        .status(401)
        .send(renderLoginPage({ clientId, redirectUri, scope, state, error: 'Invalid credentials' }));
      return;
    }

    const code = await this.oauth.createAuthorizationCode(client, redirectUri, scope);
    const url = new URL(redirectUri);
    url.searchParams.set('code', code);
    if (state) url.searchParams.set('state', state);
    res.redirect(url.toString());
  }

  // Step 3 / ongoing: Okta exchanges the code for tokens, then later calls back
  // here with grant_type=refresh_token to rotate the access token.
  @Post('token')
  async token(
    @Body('grant_type') grantType: string,
    @Body('code') code: string,
    @Body('redirect_uri') redirectUri: string,
    @Body('refresh_token') refreshToken: string,
    @Body('client_id') bodyClientId: string,
    @Body('client_secret') bodyClientSecret: string,
    @Headers('authorization') authHeader: string,
  ) {
    const basic = parseBasicAuth(authHeader);
    const clientId = basic?.clientId ?? bodyClientId;
    const clientSecret = basic?.clientSecret ?? bodyClientSecret;

    if (!clientId || !clientSecret) {
      throw new UnauthorizedException('invalid_client');
    }
    const client = await this.oauth.validateClientCredentials(clientId, clientSecret);

    if (grantType === 'authorization_code') {
      if (!code || !redirectUri) throw new BadRequestException('invalid_request');
      return this.oauth.exchangeAuthorizationCode(code, redirectUri, client);
    }

    if (grantType === 'refresh_token') {
      if (!refreshToken) throw new BadRequestException('invalid_request');
      return this.oauth.refreshAccessToken(refreshToken, client);
    }

    throw new BadRequestException('unsupported_grant_type');
  }
}

function escapeHtml(value: string): string {
  return String(value ?? '').replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c] as string),
  );
}

function renderLoginPage(params: {
  clientId: string;
  redirectUri: string;
  scope: string;
  state: string;
  error: string | null;
}): string {
  const clientId = escapeHtml(params.clientId);
  const redirectUri = escapeHtml(params.redirectUri);
  const scope = escapeHtml(params.scope);
  const state = escapeHtml(params.state);
  const error = params.error ? escapeHtml(params.error) : null;
  return `<!doctype html>
<html>
<head><meta charset="utf-8"><title>Authorize Okta SCIM Access</title></head>
<body style="font-family: sans-serif; max-width: 360px; margin: 80px auto;">
  <h2>Authorize Okta Provisioning</h2>
  <p>Sign in as an administrator to allow Okta to manage users and groups.</p>
  ${error ? `<p style="color:red">${error}</p>` : ''}
  <form method="POST" action="/oauth/authorize">
    <input type="hidden" name="client_id" value="${clientId}" />
    <input type="hidden" name="redirect_uri" value="${redirectUri}" />
    <input type="hidden" name="scope" value="${scope}" />
    <input type="hidden" name="state" value="${state}" />
    <div><label>Username<br/><input name="username" autofocus /></label></div>
    <div style="margin-top:8px"><label>Password<br/><input name="password" type="password" /></label></div>
    <button type="submit" style="margin-top:16px">Allow Access</button>
  </form>
</body>
</html>`;
}
