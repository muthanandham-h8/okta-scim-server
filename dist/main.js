"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const express = require("express");
const app_module_1 = require("./app.module");
async function bootstrap() {
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
    const port = process.env.PORT ? Number(process.env.PORT) : 3000;
    await app.listen(port);
}
bootstrap();
//# sourceMappingURL=main.js.map