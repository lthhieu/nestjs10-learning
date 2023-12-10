import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService,
        private jwtService: JwtService
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
    async login(user: any) {
        const payload = { username: user.email, sub: user.id };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
    async socialMedia(username: string, type: string) {
        const payload = { username, type };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
