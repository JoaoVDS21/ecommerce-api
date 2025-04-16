import { Injectable, NotFoundException } from '@nestjs/common';
import { EcommerceFactory } from '../ecommerce/ecommerce.factory';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {
  constructor(
    private readonly ecommerceFactory: EcommerceFactory,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {}

  async create(tenant: Tenant, body: CreateProductDto) {
    
    const product = new Product()

    product.name = body.name,
    product.price = body.price,
    product.description = body.description,
    product.tenantId = tenant?.id,
    product.isActive = body.isActive
    product.imageUrl = body.imageUrl
    
    return this.productRepository.save(product);
  }

  async update(tenant: Tenant, id: number, body: UpdateProductDto) {
    let product = await this.productRepository.findOneBy({
      id,
      tenantId: tenant?.id  
    })

    if(!product?.id) {
      throw new NotFoundException('Produto não encontrado')
    }

    product.description = body.description || product.description;
    product.name = body.name || product.name;
    product.price = body.price || product.price;
    product.isActive = body.isActive || product.isActive;
    product.imageUrl = body.imageUrl || product.imageUrl;
    
    const update = await this.productRepository.save(product)

    return update;
  }
  
  async findAll(tenant: any, params?: any) {
    const options = {
      tenantId: tenant?.id
    }

    return this.productRepository.find({
      where: options
    });
    
    // const provider = this.ecommerceFactory.getProvider(tenant.providerType, tenant.config);
    // return provider.listProducts(params, tenant.config);
  }

  async findOne(tenant: any, id: number) {
    const options = {
      tenantId: tenant?.id,
      id,
    }
    
    return this.productRepository.findOne({
      where: options
    });
  }

  async delete(tenant: Tenant, id: number) {
    return this.productRepository.delete({
      id,
      tenantId: tenant?.id
    })
  }

}