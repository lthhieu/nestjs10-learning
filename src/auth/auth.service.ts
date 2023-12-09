import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
@Injectable()
export class AuthService {
    constructor(private usersService: UsersService) { }

    async validateUser(username: string, pass: string): Promise<any> {
        const user = await this.usersService.findOneByUsername(username);
        if (user) {
            const isValidPassword = this.usersService.comparePassword(pass, user.password)
            if (isValidPassword) {
                const { password, ...result } = user;
                return result;
            }
        }
        return null;
    }
}
