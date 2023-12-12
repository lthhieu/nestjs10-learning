import { Controller, Get, Post, UseGuards, Request, Body } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from 'src/decorators/customize';

@Controller('auth')
export class AuthController {
    constructor(
        private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ResponseMessage('Login successfully')
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Public()
    @Post('social-media')
    async socialMedia(@Body('username') username: string, @Body('type') type: string) {
        return this.authService.socialMedia(
            username, type
        );
    }

    @Get('profile')
    @ResponseMessage('Fetch info user successfully')
    getProfile(@Request() req) {
        return req.user;
    }
}
