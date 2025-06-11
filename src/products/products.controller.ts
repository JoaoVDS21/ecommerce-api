import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { AuthTenantGuard } from 'src/auth/guards/auth-tenant.guard';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/storage.multer';

@Controller('products')
// @UseGuards(AuthTenantGuard)
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  create(
    @CurrentTenant() tenant, 
    @Body() body: CreateProductDto,
    @UploadedFile(new ParseFilePipe({
      fileIsRequired: false,
      validators: [
        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}), // 5mb
        new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ })
      ]
    })) image: Express.Multer.File
  ) {
    if (image) {
      body.imageUrl = `/uploads/${image.filename}`;
    }
    
    return this.productsService.create(tenant, body);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @CurrentTenant() tenant, 
    @Param('id') id: string,
    @Body() body: UpdateProductDto,
    @UploadedFile(new ParseFilePipe({
      fileIsRequired: false,
      validators: [
        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}), // 5mb
        new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ })
      ]
    })) image: Express.Multer.File
  ) {
    if (image) {
      body.imageUrl = `/uploads/${image.filename}`;
    }

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