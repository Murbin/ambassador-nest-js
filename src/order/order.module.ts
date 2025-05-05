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

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), SharedModule, LinkModule, ProductModule],
  controllers: [OrderController], providers: [OrderService, OrderItemService]
})
export class OrderModule { }
