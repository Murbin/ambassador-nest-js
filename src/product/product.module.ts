import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './product';
import { ProductController } from './product.controller';
import { SharedModule } from '../shared/shared.module';
@Module({

  imports: [TypeOrmModule.forFeature([Product]), SharedModule], //this will generate the product database table
  providers: [ProductService],
  controllers: [ProductController],
  exports: [ProductService] // This is to be able to use the service in other modules
})
export class ProductModule { }
