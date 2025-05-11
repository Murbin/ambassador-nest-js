import { ClassSerializerInterceptor, Controller, Get, Post, Body, UseGuards, UseInterceptors, BadGatewayException } from '@nestjs/common';
import { OrderService } from './order.service';
import { AuthGuard } from '../auth/auth.guard';
import { CreateOrderDto } from './dtos/create-order.dto';
import { LinkService } from '../link/link.service';
import { Order } from './order';
import { OrderItem } from './order-item';
import { Link } from '../link/link';
import { ProductService } from 'src/product/product.service';
import { Connection } from 'typeorm';
import { StripeService } from '../stripe/stripe.service';
import Stripe from 'stripe';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';


@Controller('')
@UseInterceptors(ClassSerializerInterceptor)
export class OrderController {
    constructor(
        private orderService: OrderService,
        private linkService: LinkService,
        private productService: ProductService,
        private configService: ConfigService,
        private connection: Connection,
        private stripeService: StripeService,
        private eventEmitter: EventEmitter2,
    ) { }

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
        const queryRunner = this.connection.createQueryRunner()
        try {
            await queryRunner.connect()
            await queryRunner.startTransaction()

            const o = new Order()
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

            const order = await queryRunner.manager.save(o)

            const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = []

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

                await queryRunner.manager.save(orderItem)

                line_items.push({
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: product.title,
                            description: product.description,
                            images: [product.image],
                        },
                        unit_amount: Math.round(product.price * 100),
                    },
                    quantity: p.quantity
                })
            }

            const session = await this.stripeService.createCheckoutSession({
                payment_method_types: ['card'],
                line_items,
                mode: 'payment',
                success_url: this.configService.get('CHECKOUT_SUCCESS_URL') + '?source={CHECKOUT_SESSION_ID}',
                cancel_url: this.configService.get('CHECKOUT_CANCEL_URL') + 'error',
            })

            await queryRunner.manager.update(Order, order.id, {
                transaction_id: session.id
            })

            await queryRunner.commitTransaction()

            return this.orderService.findOne({ where: { id: order.id }, relations: ['order_items'] })

        } catch (e) {
            await queryRunner.rollbackTransaction()
            throw new BadGatewayException('Error creating order')
        } finally {
            await queryRunner.release()
        }
    }

    @Post('checkout/orders/confirm')
    async confirm(@Body('source') source: string) {
        const order = await this.orderService.findOne({
            where: {
                transaction_id: source
            },
            relations: ['order_items', 'user']
        })

        if (!order) {
            throw new BadGatewayException('Order not found')
        }

        await this.orderService.update(order.id, {
            complete: true
        })

        await this.eventEmitter.emit('order.completed', order)

        return {
            message: 'success'
        }
    }



} 
