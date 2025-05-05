import { ClassSerializerInterceptor, Controller, Get, Post, Body, UseGuards, UseInterceptors, BadGatewayException } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { LinkService } from '../link/link.service';
import { Order } from './order';
import { OrderItem } from './order-item';
import { Link } from '../link/link';
import { ProductService } from 'src/product/product.service';
import { OrderItemService } from './order-items.service';

@Controller('')
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
    constructor(
        private orderService: OrderService,
        private linkService: LinkService,
        private productService: ProductService,
        private orderItemService: OrderItemService) { }

    @UseGuards(AuthGuard)
    @Get('admin/orders')
    async all() {
        return this.orderService.find({
            relations: ['order_items']
        });
    }

    @Post('checkout/orders')
    async checkout(@Body() body: CreateOrderDto) {
        const link: Link = await this.linkService.findOne({
            where: { code: body.code }, relations: ['user']
        });

        if (!link) {
            throw new BadGatewayException('Invalid link');
        }

        const o = new Order() // es una nueva instancia de la clase Order y se usa apra crear un nuevo registro en la base de datos
        o.user_id = link.user.id
        o.ambassador_email = link.user.email
        o.first_name = body.first_name
        o.last_name = body.last_name
        o.email = body.email
        o.address = body.address
        o.city = body.city
        o.country = body.country
        o.zip = body.zip
        o.code = link.code
        o.complete = false

        const order = await this.orderService.save(o)

        for (const p of body.products) {
            const product = await this.productService.findOne({ where: { id: p.product_id } })
            if (!product) {
                throw new BadGatewayException('Invalid product')
            }
            const orderItem = new OrderItem()
            orderItem.order = order
            orderItem.product_title = product.title
            orderItem.price = product.price
            orderItem.quantity = p.quantity
            orderItem.ambassador_revenue = 0.1 * product.price * p.quantity
            orderItem.admin_revenue = 0.9 * product.price * p.quantity

            await this.orderItemService.save(orderItem)
        }

        return this.orderService.findOne({ where: { id: order.id }, relations: ['order_items'] })
    }
}   
