import { Injectable } from "@nestjs/common";
import { Order } from "../order";
import { OnEvent } from "@nestjs/event-emitter";
import { RedisService } from "../../shared/redis.service";
import { MailerService } from "@nestjs-modules/mailer";

@Injectable()
export class OrderListener {
    constructor(private redisService: RedisService,
        private mailer: MailerService
    ) { }

    @OnEvent('order.completed')
    async handleOrderCompleted(order: Order) {
        const client = await this.redisService.getClient();

        await client.zIncrBy('rankings', order.ambassador_revenue, order.user.name)

        // Create HTML content for the email
        const orderItemsHtml = order.order_items.map(item => `
            <tr>
                <td>${item.product_title}</td>
                <td>${item.quantity}</td>
                <td>$${item.price.toFixed(2)}</td>
                <td>$${(item.price * item.quantity).toFixed(2)}</td>
            </tr>
        `).join('');

        const html = `
            <h1>Order Confirmation</h1>
            <p>Dear ${order.first_name} ${order.last_name},</p>
            <p>Thank you for your order! Your order has been confirmed.</p>
            
            <h2>Order Details:</h2>
            <table border="1" style="border-collapse: collapse; width: 100%;">
                <tr>
                    <th>Product</th>
                    <th>Quantity</th>
                    <th>Price</th>
                    <th>Total</th>
                </tr>
                ${orderItemsHtml}
            </table>
            
            <h3>Shipping Information:</h3>
            <p>
                Address: ${order.address}<br>
                City: ${order.city}<br>
                Country: ${order.country}<br>
                ZIP: ${order.zip}
            </p>
            
            <p>Order Total: $${order.total}</p>
            
            <p>Thank you for shopping with us!</p>
        `;

        await this.mailer.sendMail({
            to: order.email,
            subject: 'Order Confirmation - Your Order Has Been Confirmed',
            html: html
        });
    }
}