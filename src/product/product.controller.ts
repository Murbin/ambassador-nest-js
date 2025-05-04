import { Body, Controller, Delete, Get, HttpException, HttpStatus, Param, Post, Put, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductCreateDto } from './dtos/product-create.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CacheKey, CacheTTL, CacheInterceptor, Cache } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

@Controller('')
export class ProductController {
    constructor(
        private readonly productService: ProductService,
        @Inject('CACHE_MANAGER') private cacheManager: Cache,
        private eventEmitter: EventEmitter2
    ) { }

    @UseGuards(AuthGuard)
    @Get('admin/products')
    async all() {
        return this.productService.find({})
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

    @CacheKey('products_frontend')
    @CacheTTL(60 * 60)
    @UseInterceptors(CacheInterceptor)
    @Get('ambassador/products/frontend')
    async frontend() {
        return this.productService.find()
    }

}