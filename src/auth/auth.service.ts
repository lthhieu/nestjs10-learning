import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response } from 'express';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValidPassword = this.usersService.comparePassword(pass, user.password)
            if (isValidPassword) {
                return user;
            }
        }
        return null;
    }
    async login(user: IUser, response: Response) {
        const { _id, email, name, role } = user
        const payload = { _id, email, name, role, sub: 'token login', iss: 'from server' };
        const refresh_token = this.createRefreshToken(payload)
        //update refresh token to database
        await this.usersService.updateRefreshToken(refresh_token, _id)
        //set refresh token to cookies
        response.cookie('refresh_token', refresh_token, {
            httpOnly: true,
            maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE'))
        })
        return {
            access_token: this.jwtService.sign(payload),
            user: { _id, email, name, role }
        };
    }
    async register(registerUserDto: RegisterUserDto) {
        let newUser = await this.usersService.register(registerUserDto)
        return newUser
    }
    createRefreshToken = (payload: any) => {
        const refreshToken = this.jwtService.sign(payload, {
            secret: this.configService.get<string>('JWT_SECRET'),
            expiresIn: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE')) / 1000
        })
        return refreshToken
    }
    async socialMedia(username: string, type: string) {
        const payload = { username, type };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
