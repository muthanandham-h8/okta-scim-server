import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // bodyParser: false disables Nest's default body-parser registration so we
  // can install our own before anything else runs (see comment below).
  const app = await NestFactory.create(AppModule, { bodyParser: false });

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
  const port = process.env.PORT ? Number(process.env.PORT) : 3000;
  await app.listen(port);
}
bootstrap();
