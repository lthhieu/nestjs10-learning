import { Controller, Get, Post, UseGuards, Request, Body, Res } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage } from 'src/decorators/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ResponseMessage('Login successfully')
    async login(@Request() req: any, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @Post('register')
    @ResponseMessage('Register new user successfully')
    register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
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
    getProfile(@Request() req: any) {
        return req.user;
    }
}
