"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const swagger_1 = require("@nestjs/swagger");
const express = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
    var _a;
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bodyParser: false });
    app.use(express.json({ type: ['application/json', 'application/scim+json'] }));
    app.use(express.urlencoded({ extended: true }));
    app.useGlobalPipes(new common_1.ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: false,
    }));
    app.use('/scim', (req, res, next) => {
        res.type('application/scim+json');
        next();
    });
    const issuer = (_a = process.env.KEYCLOAK_ISSUER) !== null && _a !== void 0 ? _a : 'http://localhost:8080/realms/scim';
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('SCIM 2.0 Server (Keycloak-secured)')
        .setDescription('SCIM 2.0 provisioning API. Tokens are issued by Keycloak and validated ' +
        'here against Keycloak JWKS - this service issues nothing. Get a JWT from ' +
        `${issuer}/protocol/openid-connect/token, then call /scim/v2/* as Bearer.`)
        .setVersion('2.0')
        .addBearerAuth({
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Keycloak-issued JWT access token',
    }, 'keycloak-jwt')
        .addOAuth2({
        type: 'oauth2',
        description: 'Run Keycloak\'s OAuth2 flow directly from Swagger',
        flows: {
            authorizationCode: {
                authorizationUrl: `${issuer}/protocol/openid-connect/auth`,
                tokenUrl: `${issuer}/protocol/openid-connect/token`,
                scopes: { scim: 'Access the SCIM API', openid: 'OpenID Connect' },
            },
        },
    }, 'keycloak-oauth2')
        .addTag('SCIM Users', 'User provisioning (/scim/v2/Users)')
        .addTag('SCIM Groups', 'Group provisioning (/scim/v2/Groups)')
        .addTag('SCIM Discovery', 'Unauthenticated metadata endpoints')
        .build();
    const document = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, document, {
        swaggerOptions: { persistAuthorization: true },
    });
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map