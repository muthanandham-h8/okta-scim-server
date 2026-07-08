import { Module } from '@nestjs/common';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { DiscoveryController } from './discovery/discovery.controller';

// JwtAuthGuard comes from the global AuthModule, so no import needed here.
@Module({
  controllers: [UsersController, GroupsController, DiscoveryController],
  providers: [UsersService, GroupsService],
})
export class ScimModule {}
