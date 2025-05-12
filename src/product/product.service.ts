import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './product';
import { AbstractService } from '../shared/abstract.service';

@Injectable()
export class ProductService extends AbstractService {
    constructor(
        @InjectRepository(Product) private readonly productRepository: Repository<Product>
    ) {
        super(productRepository)
    }

    async paginate(page: number, limit: number): Promise<[Product[], number]> {
        const [data, total] = await this.productRepository.findAndCount({
            skip: (page - 1) * limit,
            take: limit
        });
        return [data, total];
    }
}
