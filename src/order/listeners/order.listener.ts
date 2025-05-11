import { Injectable } from "@nestjs/common";
import { Order } from "../order";
import { OnEvent } from "@nestjs/event-emitter";
import { RedisService } from "../../shared/redis.service";


@Injectable()
export class OrderListener {
    constructor(private redisService: RedisService) { }

    @OnEvent('order.completed')
    async handleOrderCompleted(order: Order) {
        console.log('Listener ejecutado, orden:', order);
        const client = await this.redisService.getClient();

        await client.zIncrBy('rankings', order.ambassador_revenue, order.user.name)
    }
}