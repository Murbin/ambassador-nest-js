import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, UseInterceptors, Query } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductCreateDto } from './dtos/product-create.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CacheKey, CacheTTL, CacheInterceptor, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Request } from 'express';
import { CustomCacheInterceptor } from './interceptors/cache.interceptor';

@Controller('')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        @Inject('CACHE_MANAGER') private cacheManager: Cache,
        private eventEmitter: EventEmitter2
    ) { }

    @UseGuards(AuthGuard)
    @Get('admin/products')
    async all(
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ) {
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const [data, total] = await this.productService.paginate(page, limit);
        const lastPage = Math.ceil(total / limit);
        return { data, total, page, lastPage };
    }

    @UseGuards(AuthGuard)
    @Post('admin/products')
    async create(@Body() body: ProductCreateDto) {
        const product = await this.productService.save(body)
        this.eventEmitter.emit('products_frontend')
        return product
    }

    @UseGuards(AuthGuard)
    @Get('admin/products/:id')
    async get(@Param('id') id: number) {
        return this.productService.findOne({ where: { id } })
    }

    @UseGuards(AuthGuard)
    @Put('admin/products/:id')
    async update(@Param('id') id: number, @Body() body: ProductCreateDto) {
        try {
            await this.productService.update(id, body)
            const product = this.productService.findOne({ where: { id } })
            this.eventEmitter.emit('products_frontend')

            return product
        } catch (error) {
            throw new HttpException(error, HttpStatus.BAD_REQUEST)
        }


    }

    @UseGuards(AuthGuard)
    @Delete('admin/products/:id')
    async delete(@Param('id') id: number) {
        const product = await this.productService.delete(id)
        this.eventEmitter.emit('products_frontend')
        return product
    }

    @UseInterceptors(CustomCacheInterceptor)
    @Get('ambassador/products/frontend')
    async frontend(
        @Query('s') s: string,
        @Query('sort') sort: string,
        @Query('page') page: number = 1
    ) {
        page = Number(page) || 1;
        let products = await this.productService.find()

        if (s) {
            products = products.filter(p => p.title.toLowerCase().includes(s.toLowerCase()) || p.description.toLowerCase().includes(s.toLowerCase()))
        }

        if (sort) {
            products = products.sort((a, b) =>
                sort === 'asc' ? a.price - b.price : b.price - a.price
            );
        }

        const perPage = 9
        const startIndex = (page - 1) * perPage
        const endIndex = page * perPage
        const data = products.slice(startIndex, endIndex)
        const total = products.length
        const lastPage = Math.ceil(total / perPage)

        return {
            data,
            total,
            page,
            lastPage
        }
    }

}