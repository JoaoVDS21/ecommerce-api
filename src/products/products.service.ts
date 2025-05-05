import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { EcommerceFactory } from '../ecommerce/ecommerce.factory';
import { Tenant } from 'src/tenants/entities/tenant.entity';
import { Product } from './entities/product.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { Category } from 'src/categories/entities/category.entity';
import { EcommerceProviderType } from 'src/tenants/entities/tenant-contract.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  
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
    product.stock = body.stock,
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
    product.stock = body.stock || product.stock;
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

  /**
   * Sincroniza todos os produtos do ecommerce vinculado ao tenant com o banco de dados local
   * @param tenantId ID do tenant para realizar a sincronização
   * @returns Resumo da operação de sincronização
   */
  async syncProductsFromEcommerce(tenant: Tenant): Promise<{
    added: number;
    updated: number;
    failed: number;
    message: string;
  }> {
    try {

      const providerType = tenant.contracts[0].ecommerceProvider;
      const providerConfig = tenant.contracts[0].config || {};

      // Obtém o provider correto com base no tipo configurado para o tenant
      const ecommerceProvider = this.ecommerceFactory.getProvider(
        providerType,
        providerConfig
      );

      this.logger.log(`Iniciando sincronização de produtos para o tenant ${tenant.id} usando provedor ${providerType}`);

      // Busca produtos do ecommerce
      const ecommerceProducts = await ecommerceProvider.listProducts({}, providerConfig);
      
      if (!ecommerceProducts || !Array.isArray(ecommerceProducts)) {
        throw new Error('Não foi possível obter a lista de produtos do ecommerce');
      }

      // Estatísticas para retornar ao final
      let added = 0;
      let updated = 0;
      let failed = 0;

      // Processa cada produto
      for (const ecommerceProduct of ecommerceProducts) {
        try {
          // Mapeia os campos do produto do ecommerce para o formato do nosso sistema
          const productData = await ecommerceProvider.mapEcommerceProductToLocalProduct(ecommerceProduct, tenant.id, providerConfig);
          
          // Verifica se o produto já existe no banco (usando algum identificador único do ecommerce)
          const existingProduct = await this.productRepository.findOne({ 
            where: { 
              name: productData.name,
              tenantId: tenant.id 
            } 
          });

          if (existingProduct) {
            // Atualiza produto existente
            await this.productRepository.update(existingProduct.id, {
              ...productData,
              updatedAt: new Date()
            });
            updated++;
            this.logger.debug(`Produto atualizado: ${productData.name}`);
          } else {
            // Cria novo produto
            await this.productRepository.save(productData);
            added++;
            this.logger.debug(`Novo produto adicionado: ${productData.name}`);
          }
        } catch (error) {
          failed++;
          this.logger.error(`Erro ao processar produto: ${ecommerceProduct?.name || 'desconhecido'}`, error.stack);
        }
      }

      const message = `Sincronização concluída para o tenant ${tenant.id}. Adicionados: ${added}, Atualizados: ${updated}, Falhas: ${failed}`;
      this.logger.log(message);

      return {
        added,
        updated,
        failed,
        message
      };
    } catch (error) {
      this.logger.error(`Erro durante sincronização de produtos: ${error.message}`, error.stack);
      throw new Error(`Falha na sincronização de produtos: ${error.message}`);
    }
  }
}