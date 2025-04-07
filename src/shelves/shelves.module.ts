import { Module } from '@nestjs/common';
import { ShelvesService } from './shelves.service';
import { EcommerceModule } from '../ecommerce/ecommerce.module';
import { TenantModule } from '../tenants/tenant.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shelf } from './entities/shelf.entity';
import { ShelvesController } from './shelves.controller';
import { Product } from 'src/products/entities/product.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shelf, Product]), EcommerceModule, TenantModule],
  controllers: [ShelvesController],
  providers: [ShelvesService],
})
export class ShelvesModule {}