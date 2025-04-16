import { Body, Controller, Delete, Get, Param, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ShelvesService } from './shelves.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { Shelf } from './entities/shelf.entity';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { UpdateShelfDto } from './dto/update-shelf.dto';

@Controller('shelves')
export class ShelvesController {
  constructor(private readonly shelvesService: ShelvesService) {}

  @Post()
  create(@CurrentTenant() tenant, @Body() body: CreateShelfDto) {
    return this.shelvesService.create(tenant, body);
  }

  @Put(':id')
  update(@CurrentTenant() tenant, @Param('id') id: string, @Body() body: UpdateShelfDto) {
    return this.shelvesService.update(tenant, +id, body);
  }
  
  @Get()
  findAll(@CurrentTenant() tenant, @Query() params) {
    return this.shelvesService.findAll(tenant, params);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.shelvesService.findOne(tenant, +id);
  }

  @Delete(':id')
  delete(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.shelvesService.delete(tenant, +id);
  }
}