import { Injectable, NotFoundException } from '@nestjs/common';
import { EcommerceFactory } from '../ecommerce/ecommerce.factory';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Shelf } from './entities/shelf.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, In, Repository } from 'typeorm';
import { UpdateShelfDto } from './dto/update-shelf.dto';
import { CreateShelfDto } from './dto/create-shelf.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class ShelvesService {
  constructor(
    private readonly ecommerceFactory: EcommerceFactory,
    @InjectRepository(Shelf) private shelfRepository: Repository<Shelf>,
    @InjectRepository(Product) private productsRepository: Repository<Product>,
  ) {}

  async create(tenant: Tenant, body: CreateShelfDto) {
    return this.shelfRepository.manager.transaction(async (transactionalEntityManager: EntityManager) => {
      if (body.position !== undefined) {
        await transactionalEntityManager
          .createQueryBuilder()
          .update(Shelf)
          .set({
            position: () => 'position + 1' // Incrementa a posição usando SQL puro
          })
          .where('tenantId = :tenantId AND position >= :position', {
            tenantId: tenant.id,
            position: body.position
          })
          .execute();
      }
  
      const shelf = new Shelf();
      shelf.title = body.title;
      shelf.position = body.position;
      shelf.isActive = body.isActive;
      shelf.tenantId = tenant.id;
      
      shelf.products = await transactionalEntityManager
        .getRepository(Product)
        .find({
          where: {
            id: In(body.products_ids)
          }
        });
  
      return transactionalEntityManager.save(Shelf, shelf);
    });
  }

  async update(tenant: Tenant, id: number, body: UpdateShelfDto) {
    let shelf = await this.shelfRepository.findOneBy({
      id,
      tenantId: tenant.id  
    })

    if(!shelf?.id) {
      throw new NotFoundException('Categoria não encontrada')
    }

    shelf.title = body.title || shelf.title;
    shelf.position = body.position || shelf.position;
    shelf.isActive = body.isActive || shelf.isActive;
    shelf.products = await this.productsRepository.find({
      where: {
        id: In([...(body.products_ids || [])])
      }
    })
    
    const update = await this.shelfRepository.save(shelf)

    return update;
  }
  
  async findAll(tenant: Tenant, params?: any) {
    const options = {
      tenantId: tenant.id
    }

    return this.shelfRepository.find({
      where: options,
      order: {
        position: 'ASC'
      },
      relations: {
        products: true
      }
    });
  }

  async findOne(tenant: Tenant, id: number) {
    const options = {
      tenantId: tenant.id,
      id,
    }
    
    return this.shelfRepository.findOne({
      where: options,
      relations: {
        products: true
      }
    });
  }

  async delete(tenant: Tenant, id: number) {
    return this.shelfRepository.delete({
      id,
      tenantId: tenant.id
    })
  }

}