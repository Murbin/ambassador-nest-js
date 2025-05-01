import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { OrderItem } from './order-item';
import { InjectRepository } from '@nestjs/typeorm';
import { AbstractService } from '../shared/abstract.service';

@Injectable()
export class OrderItemService extends AbstractService {
    constructor(
        @InjectRepository(OrderItem) private readonly orderItemRepository: Repository<OrderItem>
    ) {
        super(orderItemRepository)
    }
}
