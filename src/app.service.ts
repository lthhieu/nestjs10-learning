import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(port: number): string {
    return `Hi World! in port ${port}`;
  }
}
