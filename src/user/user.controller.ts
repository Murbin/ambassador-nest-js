import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '../auth/auth.guard';
import { RedisService } from '../shared/redis.service';

@Controller()
@UseInterceptors(ClassSerializerInterceptor)
export class UserController {

    constructor(
        private readonly userService: UserService,
        private readonly redisService: RedisService
    ) { }

    @UseGuards(AuthGuard)
    @Get('admin/ambassadors')
    async ambassadors() {
        return this.userService.find({
            where: { is_ambassador: true }
        })
    }

    @Get('ambassador/rankings')
    async rankings() {
        const client = await this.redisService.getClient();
        const ambassadors = await client.zRangeWithScores('rankings', 0, -1, { REV: true });
        const result = {};
        ambassadors.forEach(item => {
            result[item.value] = item.score.toString();
        });
        return result;
    }
}   