import { Module } from '@nestjs/common';
import { OrderController } from './order.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderItem } from './order-item';
import { Order } from './order';
import { OrderService } from './order.service';
import { OrderItemService } from './order-items.service';
import { SharedModule } from '../shared/shared.module';
import { LinkModule } from 'src/link/link.module';
import { ProductModule } from 'src/product/product.module';
import { StripeModule } from '../stripe/stripe.module';
import { OrderListener } from './listeners/order.listener';
import { MailerModule } from '@nestjs-modules/mailer';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem]),
    SharedModule,
    LinkModule,
    ProductModule,
    StripeModule,
    MailerModule.forRoot({
      transport: {
        host: 'host.docker.internal',
        port: 1025,
      },
      defaults: {
        from: 'no-reply@nest-ambassador.com'
      }
    }),
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderItemService, OrderListener]
})
export class OrderModule { }
