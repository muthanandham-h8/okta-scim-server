import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { OAuthModule } from './oauth/oauth.module';
import { ScimModule } from './scim/scim.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    OAuthModule,
    ScimModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
