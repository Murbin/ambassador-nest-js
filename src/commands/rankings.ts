import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { RedisService } from '../shared/redis.service';
import { UserService } from '../user/user.service';
import { User } from '../user/user';

(async () => {
    const app = await NestFactory.createApplicationContext(AppModule);

    const userService = app.get(UserService);

    const ambassadors: User[] = await userService.find({
        where: {
            is_ambassador: true
        },
        relations: ['orders', 'orders.order_items']
    });

    const redisService = app.get(RedisService);
    const client = await redisService.getClient();

    for (let i = 0; i < ambassadors.length; i++) {
        await client.zAdd('rankings', {
            score: ambassadors[i].revenue,
            value: ambassadors[i].name
        });
    }

    await app.close();
    process.exit();
})();       