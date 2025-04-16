import { Module } from '@nestjs/common';
import { BannersController } from './banners.controller';
import { BannersService } from './banners.service';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { TenantModule } from '../tenants/tenant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Banner } from './entities/banner.entity';
import { Category } from 'src/categories/entities/category.entity';
import { Shelf } from 'src/shelves/entities/shelf.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Banner, Category, Shelf]), EcommerceModule, TenantModule],
  controllers: [BannersController],
  providers: [BannersService],
})
export class BannersModule {}