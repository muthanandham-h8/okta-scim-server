import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiExcludeEndpoint } from '@nestjs/swagger';

@Controller()
export class AppController {
  // Root and the old /demo path both land on the dashboard at /home.
  @ApiExcludeEndpoint()
  @Get()
  @Redirect('/home', 302)
  root(): void {}

  @ApiExcludeEndpoint()
  @Get('demo')
  @Redirect('/home', 302)
  demo(): void {}
}
