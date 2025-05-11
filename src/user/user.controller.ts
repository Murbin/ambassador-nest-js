import { ClassSerializerInterceptor, Controller, Get, UseGuards, UseInterceptors, Query } from '@nestjs/common';
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
    async ambassadors(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const [data, total] = await this.userService.paginateAmbassadors(page, limit);
        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
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