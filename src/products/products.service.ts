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
import { VtexService } from '../ecommerce/providers/vtex/vtex.service';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);
  
  constructor(
    private readonly ecommerceFactory: EcommerceFactory,
    @InjectRepository(Product) private productRepository: Repository<Product>,
    @InjectRepository(Category) private categoryRepository: Repository<Category>
  ) {}

  async create(tenant: Tenant, body: CreateProductDto) {
    const product = new Product();

    product.name = body.name;
    product.price = body.price;
    product.description = body.description;
    product.stock = body.stock;
    product.tenantId = tenant?.id;
    product.isActive = body.isActive;
    product.imageUrl = body.imageUrl;
    product.ecommerceProviderProductId = body.ecommerceProviderProductId;
    
    return this.productRepository.save(product);
  }

  async update(tenant: Tenant, id: number, body: UpdateProductDto) {
    let product = await this.productRepository.findOneBy({
      id,
      tenantId: tenant?.id  
    });

    if (!product?.id) {
      throw new NotFoundException('Produto não encontrado');
    }

    product.description = body.description || product.description;
    product.name = body.name || product.name;
    product.price = body.price || product.price;
    product.stock = body.stock || product.stock;
    product.isActive = body.isActive !== undefined ? body.isActive : product.isActive;
    product.imageUrl = body.imageUrl || product.imageUrl;
    product.ecommerceProviderProductId = body.ecommerceProviderProductId || product.ecommerceProviderProductId;
    
    const update = await this.productRepository.save(product);
    return update;
  }
  
  /**
   * Retorna todos os produtos: locais (já integrados) + produtos do ecommerce (não integrados)
   */
  async findAll(tenant: Tenant, params?: any): Promise<Product[]> {
    try {
      // Busca produtos locais
      const localProducts = await this.productRepository.find({
        where: { tenantId: tenant?.id }
      });

      // Se não há configuração de ecommerce, retorna apenas produtos locais
      if (!tenant.contracts?.[0]?.ecommerceProvider) {
        return localProducts;
      }

      // Obtém produtos do ecommerce
      const ecommerceProducts = await this.getEcommerceProducts(tenant, params);

      console.log({ecommerceProductsLenth: ecommerceProducts.length})
      
      // Filtra produtos do ecommerce que já não estão no banco local
      const existingEcommerceProductIds = new Set(
        localProducts
          .filter(p => p.ecommerceProviderProductId)
          .map(p => p.ecommerceProviderProductId)
      );

      const newEcommerceProducts = ecommerceProducts.filter(
        product => !existingEcommerceProductIds.has(product.ecommerceProviderProductId)
      );

      // Merge: produtos locais + produtos do ecommerce não integrados
      return [...localProducts, ...newEcommerceProducts];

    } catch (error) {
      this.logger.error('Erro ao buscar produtos:', error);
      return error;
      // Em caso de erro, retorna apenas produtos locais
      return this.productRepository.find({
        where: { tenantId: tenant?.id }
      });
    }
  }

  /**
   * Busca produto específico, primeiro no banco local, depois no ecommerce
   */
  async findOne(tenant: Tenant, id: number): Promise<Product | null> {
    // Primeiro tenta buscar no banco local
    const localProduct = await this.productRepository.findOne({
      where: { 
        id,
        tenantId: tenant?.id 
      }
    });

    if (localProduct) {
      return localProduct;
    }

    // Se não encontrou local e há configuração de ecommerce, busca no ecommerce
    if (tenant.contracts?.[0]?.ecommerceProvider) {
      try {
        const ecommerceProduct = await this.getEcommerceProductById(tenant, id.toString());
        return ecommerceProduct;
      } catch (error) {
        this.logger.error(`Erro ao buscar produto ${id} no ecommerce:`, error);
      }
    }

    return null;
  }

  async delete(tenant: Tenant, id: number) {    
    return this.productRepository.delete({
      id,
      tenantId: tenant?.id
    });
  }

  /**
   * Busca produtos do ecommerce e os mapeia para o formato local
   */
  private async getEcommerceProducts(tenant: Tenant, params?: any): Promise<Product[]> {
    const providerType = tenant.contracts[0].ecommerceProvider;
    const providerConfig = tenant.contracts[0].config || {};

    const ecommerceProvider = this.ecommerceFactory.getProvider(providerType, providerConfig);
    const ecommerceProducts = await ecommerceProvider.listProducts(params, providerConfig);

    if (!ecommerceProducts || !Array.isArray(ecommerceProducts)) {
      return [];
    }

    // Mapeia produtos do ecommerce para o formato local
    const mappedProducts: Product[] = [];
    
    for (const ecommerceProduct of ecommerceProducts) {
      try {
        let mappedProduct: Partial<Product>;

        // Para outros provedores, usa o método genérico
        mappedProduct = await ecommerceProvider.mapEcommerceProductToLocalProduct(
          ecommerceProduct, 
          tenant.id, 
          providerConfig
        );

        // Cria uma instância de Product com os dados mapeados
        const product = new Product();
        Object.assign(product, mappedProduct);
        
        mappedProducts.push(product);
      } catch (error) {
        this.logger.error(`Erro ao mapear produto do ecommerce:`, error);
      }
    }

    return mappedProducts;
  }

  /**
   * Busca produto específico do ecommerce
   */
  private async getEcommerceProductById(tenant: Tenant, productId: string): Promise<Product | null> {
    const providerType = tenant.contracts[0].ecommerceProvider;
    const providerConfig = tenant.contracts[0].config || {};

    const ecommerceProvider = this.ecommerceFactory.getProvider(providerType, providerConfig);
    
    try {
      const ecommerceProduct = await ecommerceProvider.getProduct(productId, providerConfig);
      
      if (!ecommerceProduct) {
        return null;
      }

      let mappedProduct: Partial<Product>;

      // Se for VTEX, usa o mapper específico
      if (providerType === EcommerceProviderType.VTEX) {
        const vtexService = ecommerceProvider as VtexService;
        mappedProduct = vtexService.mapVtexProductToLocalProduct(ecommerceProduct, tenant.id);
      } else {
        // Para outros provedores, usa o método genérico
        mappedProduct = await ecommerceProvider.mapEcommerceProductToLocalProduct(
          ecommerceProduct, 
          tenant.id, 
          providerConfig
        );
      }

      // Cria uma instância de Product com os dados mapeados
      const product = new Product();
      Object.assign(product, mappedProduct);
      
      return product;
    } catch (error) {
      this.logger.error(`Erro ao buscar produto ${productId} no ecommerce:`, error);
      return null;
    }
  }

  /**
   * Sincroniza todos os produtos do ecommerce vinculado ao tenant com o banco de dados local
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

      const ecommerceProvider = this.ecommerceFactory.getProvider(providerType, providerConfig);

      this.logger.log(`Iniciando sincronização de produtos para o tenant ${tenant.id} usando provedor ${providerType}`);

      const ecommerceProducts = await ecommerceProvider.listProducts({}, providerConfig);
      
      if (!ecommerceProducts || !Array.isArray(ecommerceProducts)) {
        throw new Error('Não foi possível obter a lista de produtos do ecommerce');
      }

      let added = 0;
      let updated = 0;
      let failed = 0;

      for (const ecommerceProduct of ecommerceProducts) {
        try {
          let productData: Partial<Product>;

          // Se for VTEX, usa o mapper específico
          if (providerType === EcommerceProviderType.VTEX) {
            const vtexService = ecommerceProvider as VtexService;
            productData = vtexService.mapVtexProductToLocalProduct(ecommerceProduct, tenant.id);
          } else {
            // Para outros provedores, usa o método genérico
            productData = await ecommerceProvider.mapEcommerceProductToLocalProduct(
              ecommerceProduct, 
              tenant.id, 
              providerConfig
            );
          }
          
          // Verifica se o produto já existe no banco usando o ID do ecommerce
          const existingProduct = await this.productRepository.findOne({ 
            where: { 
              ecommerceProviderProductId: productData.ecommerceProviderProductId,
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