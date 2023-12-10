import { Controller, Get, } from '@nestjs/common';
import { AppService } from './app.service';
import { ConfigService } from '@nestjs/config';
import { Public } from './decorators/customize';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService,
    private configService: ConfigService) { }
  @Public()
  @Get()
  hiWorld() {
    return this.appService.getHello(this.configService.get<number>('PORT'))
  }
}
