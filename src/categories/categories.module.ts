import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { TenantModule } from '../tenants/tenant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Product]), EcommerceModule, TenantModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}