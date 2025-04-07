import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { TenantModule } from '../tenants/tenant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shelf } from 'src/shelves/entities/shelf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Product, Category, Shelf]), EcommerceModule, TenantModule],
  controllers: [ProductsController],
  providers: [ProductsService],
})
export class ProductsModule {}