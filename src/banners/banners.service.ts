import { Injectable, NotFoundException } from '@nestjs/common';
import { EcommerceFactory } from '../ecommerce/ecommerce.factory';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Banner } from './entities/banner.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateBannerDto } from './dto/update-banner.dto';
import { CreateBannerDto } from './dto/create-banner.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class BannersService {
  constructor(
    @InjectRepository(Banner) private bannerRepository: Repository<Banner>,
  ) {}

  async create(tenant: Tenant, body: CreateBannerDto) {
    const banner = new Banner()

    banner.title = body.title
    banner.position = body.position
    banner.tenantId = tenant?.id,
    banner.isActive = body.isActive
    banner.imageUrl = body.imageUrl
    
    return this.bannerRepository.save(banner);
  }

  async update(tenant: Tenant, id: number, body: UpdateBannerDto) {
    let banner = await this.bannerRepository.findOneBy({
      id,
      tenantId: tenant?.id  
    })

    if(!banner?.id) {
      throw new NotFoundException('Produto não encontrado')
    }

    banner.title = body.title || banner.title;
    banner.position = body.position || banner.position;
    banner.isActive = body.isActive || banner.isActive;
    banner.imageUrl = body.imageUrl || banner.imageUrl;
    
    const update = await this.bannerRepository.save(banner)

    return update;
  }
  
  async findAll(tenant: any, params?: any) {
    const options = {
      tenantId: tenant?.id
    }

    return this.bannerRepository.find({
      where: options,
      order: {
        position: 'ASC'
      }
    });
  }

  async findOne(tenant: any, id: number) {
    const options = {
      tenantId: tenant?.id,
      id,
    }
    
    return this.bannerRepository.findOne({
      where: options
    });
  }

  async delete(tenant: Tenant, id: number) {
    return this.bannerRepository.delete({
      id,
      tenantId: tenant?.id
    })
  }

}