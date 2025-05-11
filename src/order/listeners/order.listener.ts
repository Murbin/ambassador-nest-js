import { Injectable } from "@nestjs/common";
import { Order } from "../order";
import { OnEvent } from "@nestjs/event-emitter";
import { RedisService } from "src/shared/redis.service";


@Injectable()
export class OrderListener {
    constructor(private redisService: RedisService) { }

    @OnEvent('order.completed')
    async handleOrderCompleted(order: Order) {
        const orderItems = order.order_items

        const client = this.redisService.getClient()

            ; (await client).zIncrBy('rankings', order.ambassador_revenue, order.user.name)
    }
}