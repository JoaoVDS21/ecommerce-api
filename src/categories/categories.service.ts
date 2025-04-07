import { Injectable, NotFoundException } from '@nestjs/common';
import { EcommerceFactory } from '../ecommerce/ecommerce.factory';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Category } from './entities/category.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly ecommerceFactory: EcommerceFactory,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {}

  create(tenant: Tenant, body: CreateCategoryDto) {    
    const category = this.categoryRepository.create({
      ...body,
      tenantId: tenant.id
    })
    
    return this.categoryRepository.save(category);
  }

  async update(tenant: Tenant, id: number, body: UpdateCategoryDto) {
    let category = await this.categoryRepository.findOneBy({
      id,
      tenantId: tenant.id  
    })

    if(!category?.id) {
      throw new NotFoundException('Categoria não encontrada')
    }

    category.name = body.name || category.name;
    
    const update = await this.categoryRepository.save(category)

    return update;
  }
  
  async findAll(tenant: Tenant, params?: any) {
    const options = {
      tenantId: tenant.id
    }

    return this.categoryRepository.find({
      where: options
    });
  }

  async findOne(tenant: Tenant, id: number) {
    const options = {
      tenantId: tenant.id,
      id,
    }
    
    return this.categoryRepository.findOneBy({
      ...options
    });
  }

  async delete(tenant: Tenant, id: number) {
    return this.categoryRepository.delete({
      id,
      tenantId: tenant.id
    })
  }

}