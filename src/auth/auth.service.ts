import { BadRequestException, Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
import { RegisterUserDto } from 'src/users/dto/create-user.dto';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { Response, response } from 'express';
import { RolesService } from 'src/roles/roles.service';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService,
        private configService: ConfigService,
        private rolesService: RolesService
    ) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValidPassword = this.usersService.comparePassword(pass, user.password)
            if (isValidPassword) {
                // Convert object to string
                const jsonString = JSON.stringify(user)
                // Convert string back to plain object
                const rawObject = JSON.parse(jsonString)
                let role = (await this.rolesService.findOne(rawObject.role._id)) as any
                rawObject.permissions = role?.permissions ?? []
                return rawObject;
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
            user: { _id, email, name, role, permissions: user.permissions }
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
    refreshAccessToken = async (refresh_token: string, response: Response) => {
        try {
            this.jwtService.verify(refresh_token, {
                secret: this.configService.get<string>('JWT_SECRET')
            })
            let user = await this.usersService.findUserByToken(refresh_token)
            if (user) {
                //update 
                const { _id, email, name, role } = user
                const id = _id.toString()
                const payload = { id, email, name, role, sub: 'token refresh', iss: 'from server' };
                const refresh_token = this.createRefreshToken(payload)
                //update refresh token to database
                await this.usersService.updateRefreshToken(refresh_token, id)
                //fetch user's role
                const jsonString = JSON.stringify(user)
                const rawObject = JSON.parse(jsonString)
                let roles = await this.rolesService.findOne(rawObject.role._id) as any
                //set refresh token to cookies
                response.cookie('refresh_token', refresh_token, {
                    httpOnly: true,
                    maxAge: ms(this.configService.get<string>('REFRESH_TOKEN_EXPIRE'))
                })
                return {
                    access_token: this.jwtService.sign(payload),
                    user: { _id, email, name, role, permissions: roles.permissions ?? [] }
                };
            } else {
                throw new BadRequestException('Refresh token is invalid. Please login! in users')
            }
        } catch (e) {
            throw new BadRequestException('Refresh token is invalid. Please login!')
        }
    }
    logout = async (user: IUser, response: Response) => {
        const { _id } = user
        //refreshToken = null
        await this.usersService.updateRefreshToken(null, _id)
        //delete cookies
        response.clearCookie('refresh_token')
        return "ok"
    }
    // async socialMedia(username: string, type: string) {
    //     const payload = { username, type };
    //     return {
    //         access_token: this.jwtService.sign(payload),
    //     };
    // }
}
