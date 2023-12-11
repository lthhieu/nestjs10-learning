import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { IUser } from 'src/users/users.interface';
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
    async login(user: IUser) {
        const { _id, email, name, role } = user
        const payload = { _id, email, name, role, sub: 'token login', iss: 'from server' };
        return {
            access_token: this.jwtService.sign(payload),
            _id, email, name, role
        };
    }
    async socialMedia(username: string, type: string) {
        const payload = { username, type };
        return {
            access_token: this.jwtService.sign(payload),
        };
    }
}
