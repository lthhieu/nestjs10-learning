import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ThrottlerModuleOptions, ThrottlerOptionsFactory } from "@nestjs/throttler";

@Injectable()
export class ThrottlerConfigService implements ThrottlerOptionsFactory {
    constructor(
        private configService: ConfigService) { }
    createThrottlerOptions(): ThrottlerModuleOptions {
        return {
            throttlers: [{
                ttl: this.configService.get<number>('TTL'),
                limit: this.configService.get<number>('LIMIT')
            }],
            errorMessage: 'Too many requests in one minute!'
        };
    }

}