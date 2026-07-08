import { Global, Module } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';

// Global so the SCIM controllers can attach JwtAuthGuard without importing a
// module each. The guard itself only depends on ConfigService.
@Global()
@Module({
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}
