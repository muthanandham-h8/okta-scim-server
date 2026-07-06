import { Module } from '@nestjs/common';
import { OAuthModule } from '../oauth/oauth.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';
import { GroupsController } from './groups/groups.controller';
import { GroupsService } from './groups/groups.service';
import { DiscoveryController } from './discovery/discovery.controller';

@Module({
  imports: [OAuthModule],
  controllers: [UsersController, GroupsController, DiscoveryController],
  providers: [UsersService, GroupsService],
})
export class ScimModule {}
