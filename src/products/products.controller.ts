import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

@Controller('products')
@UseGuards(AuthTenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  create(@CurrentTenant() tenant, @Body() body: CreateProductDto) {
    return this.productsService.create(tenant, body);
  }

  @Put(':id')
  update(@CurrentTenant() tenant, @Param('id') id: string, @Body() body: UpdateProductDto) {
    return this.productsService.update(tenant, +id, body);
  }
  
  @Get()
  findAll(@CurrentTenant() tenant, @Query() params) {
    return this.productsService.findAll(tenant, params);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.productsService.findOne(tenant, +id);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.productsService.delete(tenant, +id);
  }
}