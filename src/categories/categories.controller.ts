import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Post()
  create(@CurrentTenant() tenant, @Body() body: CreateCategoryDto) {
    return this.categoriesService.create(tenant, body);
  }

  @Put(':id')
  update(@CurrentTenant() tenant, @Param('id') id: string, @Body() body: UpdateCategoryDto) {
    return this.categoriesService.update(tenant, +id, body);
  }
  
  @Get()
  findAll(@CurrentTenant() tenant, @Query() params) {
    return this.categoriesService.findAll(tenant, params);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.categoriesService.findOne(tenant, +id);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.categoriesService.delete(tenant, +id);
  }
}