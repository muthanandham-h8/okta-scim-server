import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as express from 'express';
import { AppModule } from './app.module';
import { RequestLoggingInterceptor } from './common/logging.interceptor';

async function bootstrap() {
  // bodyParser: false disables Nest's default body-parser registration so we
  // can install our own before anything else runs (see comment below).
  // logger levels include 'debug'/'verbose' so the request + JWT-decode logs
  // show in the backend console.
  const app = await NestFactory.create(AppModule, {
    bodyParser: false,
    logger: ['error', 'warn', 'log', 'debug', 'verbose'],
  });

  // Okta (and most SCIM clients) send Content-Type: application/scim+json,
  // which Express's default JSON parser ignores since it only matches
  // application/json - without this, request bodies silently parse as empty.
  app.use(express.json({ type: ['application/json', 'application/scim+json'] }));
  app.use(express.urlencoded({ extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: false,
    }),
  );
  app.use('/scim', (req, res, next) => {
    res.type('application/scim+json');
    next();
  });

  // Log every request (method, path, client, redacted body) + response status.
  app.useGlobalInterceptors(new RequestLoggingInterceptor());

  // OpenAPI / Swagger docs at /docs (JSON at /docs-json). Tokens are now issued
  // by Keycloak (the authorization server); this API only validates them. Two
  // ways to authenticate in the UI: paste a JWT (keycloak-jwt), or let Swagger
  // run Keycloak's OAuth2 flow for you (keycloak-oauth2).
  const issuer = process.env.KEYCLOAK_ISSUER ?? 'http://localhost:8080/realms/scim';
  const swaggerConfig = new DocumentBuilder()
    .setTitle('SCIM 2.0 Server (Keycloak-secured)')
    .setDescription(
      'SCIM 2.0 provisioning API. Tokens are issued by Keycloak and validated ' +
        'here against Keycloak JWKS - this service issues nothing. Get a JWT from ' +
        `${issuer}/protocol/openid-connect/token, then call /scim/v2/* as Bearer.`,
    )
    .setVersion('2.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak-issued JWT access token',
      },
      'keycloak-jwt',
    )
    .addOAuth2(
      {
        type: 'oauth2',
        description: 'Run Keycloak\'s OAuth2 flow directly from Swagger',
        flows: {
          authorizationCode: {
            authorizationUrl: `${issuer}/protocol/openid-connect/auth`,
            tokenUrl: `${issuer}/protocol/openid-connect/token`,
            scopes: { scim: 'Access the SCIM API', openid: 'OpenID Connect' },
          },
        },
      },
      'keycloak-oauth2',
    )
    .addTag('SCIM Users', 'User provisioning (/scim/v2/Users)')
    .addTag('SCIM Groups', 'Group provisioning (/scim/v2/Groups)')
    .addTag('SCIM Discovery', 'Unauthenticated metadata endpoints')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}
bootstrap();
