import { Controller, Get, Post, UseGuards, Body, Res, Req } from '@nestjs/common';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from 'src/decorators/customize';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { Request, Response } from 'express';
import { IUser } from 'src/users/users.interface';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    @ResponseMessage('Login successfully')
    async login(@Req() req: any, @Res({ passthrough: true }) response: Response) {
        return this.authService.login(req.user, response);
    }

    @Public()
    @Post('register')
    @ResponseMessage('Register new user successfully')
    register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }

    // @Public()
    // @Post('social-media')
    // async socialMedia(@Body('username') username: string, @Body('type') type: string) {
    //     return this.authService.socialMedia(
    //         username, type
    //     );
    // }

    @Get('account')
    @ResponseMessage('Fetch info user successfully')
    getProfile(@User() user: IUser) {
        return { user }
    }

    @Public()
    @Get('refresh')
    @ResponseMessage('Refresh token successfully')
    refreshToken(@Req() request: Request, @Res({ passthrough: true }) response: Response) {
        const refresh_token = request.cookies['refresh_token']
        return this.authService.refreshAccessToken(refresh_token, response)
    }

    @Post('logout')
    @ResponseMessage('Logout successfully')
    logout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
        return this.authService.logout(user, response);
    }
}
