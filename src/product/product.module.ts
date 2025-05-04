import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product';
import { ProductController } from './product.controller';
import { SharedModule } from '../shared/shared.module';
import { CacheModule } from '@nestjs/cache-manager';
import { ProductListener } from './listeners/product.listener';

@Module({
  imports: [TypeOrmModule.forFeature([Product]), SharedModule, CacheModule.register()], //this will generate the product database table
  controllers: [ProductController],
  exports: [ProductService, CacheModule], // This is to be able to use the service in other modules
  providers: [ProductService, ProductListener],
})
export class ProductModule { }
