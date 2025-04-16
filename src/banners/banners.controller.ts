import { Body, Controller, Delete, FileTypeValidator, Get, MaxFileSizeValidator, Param, ParseFilePipe, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { BannersService } from './banners.service';
import { CurrentTenant } from '../common/decorators/tenant.decorator';
import { CreateBannerDto } from './dto/create-banner.dto';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { storage } from 'src/common/utils/storage.multer';

@Controller('banners')
export class BannersController {
  constructor(private readonly bannersService: BannersService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image', { storage }))
  create(
    @CurrentTenant() tenant, 
    @Body() body: CreateBannerDto,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}), // 5mb
        new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ })
      ]
    })) image: Express.Multer.File
  ) {
    const imageUrl = `/uploads/${tenant?.id}/${image.filename}`;
    
    return this.bannersService.create(tenant, {
      ...body,
      imageUrl
    });
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('image', { storage }))
  update(
    @CurrentTenant() tenant, 
    @Param('id') id: string,
    @Body() body: UpdateBannerDto,
    @UploadedFile(new ParseFilePipe({
      validators: [
        new MaxFileSizeValidator({maxSize: 5 * 1024 * 1024}), // 5mb
        new FileTypeValidator({ fileType: /image\/(jpeg|jpg|png|webp)/ })
      ]
    })) image: Express.Multer.File
  ) {
    if (image) {
      body.imageUrl = `/uploads/${tenant?.id}/${image.filename}`;
    }

    return this.bannersService.update(tenant, +id, body);
  }
  
  @Get()
  findAll(@CurrentTenant() tenant, @Query() params) {
    return this.bannersService.findAll(tenant, params);
  }

  @Get(':id')
  findOne(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.bannersService.findOne(tenant, +id);
  } 

  @Delete(':id')
  delete(@CurrentTenant() tenant, @Param('id') id: string) {
    return this.bannersService.delete(tenant, +id);
  }
}