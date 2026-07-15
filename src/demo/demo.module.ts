import { Module } from '@nestjs/common';
import { HomeController } from './home.controller';
import { DocsController } from './docs.controller';
import { EventsStore } from './events.store';

// Presentation module: the live dashboard (/home) and the documentation
// (/docs, /docs/:method). The SCIM API itself lives in ScimModule.
@Module({
  controllers: [HomeController, DocsController],
  providers: [EventsStore],
})
export class DemoModule {}
