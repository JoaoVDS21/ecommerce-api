import { Module } from '@nestjs/common';
import { CategoriesController } from './categories.controller';
import { CategoriesService } from './categories.service';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { TenantModule } from '../tenants/tenant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category]), EcommerceModule, TenantModule],
  controllers: [CategoriesController],
  providers: [CategoriesService],
})
export class CategoriesModule {}