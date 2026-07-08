import { Module } from '@nestjs/common';
import { DemoController } from './demo.controller';
import { EventsStore } from './events.store';

@Module({
  controllers: [DemoController],
  providers: [EventsStore],
})
export class DemoModule {}
