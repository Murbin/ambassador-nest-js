import { Injectable } from '@nestjs/common';
import { User } from '../user/user';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../user/user.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private userService: UserService
    ) { }

    async user(req: Request & { cookies: { jwt: string } }) {
        const cookie = req.cookies['jwt']

        const { id } = await this.jwtService.verifyAsync(cookie)

        return this.userService.findOne({ where: { id } })

    }
}
