import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { ScimModule } from './scim/scim.module';
import { DemoModule } from './demo/demo.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    ScimModule,
    DemoModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
