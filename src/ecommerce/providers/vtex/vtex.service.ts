import { Injectable, Logger } from '@nestjs/common';
import { EcommerceProvider } from '../../../common/interfaces/ecommerce-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/products/entities/product.entity';

interface VtexProduct {
  productId: string;
  productName: string;
  brand: string;
  categoryId: string;
  categoryName: string;
  productTitle: string;
  linkText: string;
  productReference: string;
  description: string;
  items: Array<{
    itemId: string;
    name: string;
    nameComplete: string;
    complementName: string;
    ean: string;
    measurementUnit: string;
    unitMultiplier: number;
    modalType: string;
    isKit: boolean;
    images: Array<{
      imageId: string;
      imageLabel: string;
      imageTag: string;
      imageUrl: string;
      imageText: string;
      imageLastModified: string;
    }>;
    sellers: Array<{
      sellerId: string;
      sellerName: string;
      addToCartLink: string;
      sellerDefault: boolean;
      commertialOffer: {
        DeliverySlaSamplesPerRegion: any;
        Installments: Array<any>;
        DiscountHighLight: Array<any>;
        GiftSkuIds: Array<any>;
        Teasers: Array<any>;
        BuyTogether: Array<any>;
        ItemMetadataAttachment: Array<any>;
        Price: number;
        ListPrice: number;
        PriceWithoutDiscount: number;
        RewardValue: number;
        PriceValidUntil: string;
        AvailableQuantity: number;
        Tax: number;
        DeliverySlaSamples: Array<any>;
        GetInfoErrorMessage: string | null;
        CacheVersionUsedToCallCheckout: string;
      };
    }>;
  }>;
}

@Injectable()
export class VtexService implements EcommerceProvider {
  private readonly logger = new Logger(VtexService.name);

  constructor(private readonly httpService: HttpService) {}

  private getConfig(tenantConfig: any) {
    return {
      baseUrl: tenantConfig.baseUrl || 'https://api.vtex.com',
      apiKey: tenantConfig.apiKey,
      apiToken: tenantConfig.apiToken,
    };
  }

  async listProducts(params: any = {}, tenantConfig?: any): Promise<VtexProduct[]> {
    try {
      const config = this.getConfig(tenantConfig);
      const response = await firstValueFrom(
        this.httpService.get(`${config.baseUrl}/api/catalog_system/pub/products/search`, {
          headers: {
            'X-VTEX-API-AppKey': config.apiKey,
            'X-VTEX-API-AppToken': config.apiToken,
          },
          params,
        })
      );

      console.log({responseDataLength: response.data?.length})
      return response.data;
    } catch (error) {
      this.logger.error('Erro ao buscar produtos da VTEX:', error);
      throw error;
    }
  }

  async getProduct(id: string, tenantConfig?: any): Promise<VtexProduct> {
    try {
      const config = this.getConfig(tenantConfig);
      const response = await firstValueFrom(
        this.httpService.get(`${config.baseUrl}/api/catalog_system/pub/products/productget/${id}`, {
          headers: {
            'X-VTEX-API-AppKey': config.apiKey,
            'X-VTEX-API-AppToken': config.apiToken,
          },
        })
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Erro ao buscar produto ${id} da VTEX:`, error);
      throw error;
    }
  }

  async createProduct() {
    // Implementar quando necessário
  }

  async updateProduct() {
    // Implementar quando necessário
  }

  async deleteProduct() {
    // Implementar quando necessário
    return null as any;
  }

  /**
   * Mapeia um produto da VTEX para o formato do produto local
   */
  mapVtexProductToLocalProduct(vtexProduct: VtexProduct, tenantId: string): Partial<Product> {
    // Pega o primeiro item e o primeiro seller para extrair preço e estoque
    const firstItem = vtexProduct.items?.[0];
    const firstSeller = firstItem?.sellers?.[0];
    const commercialOffer = firstSeller?.commertialOffer;

    // Pega a primeira imagem disponível
    const firstImage = firstItem?.images?.[0];

    return {
      name: vtexProduct.productTitle || vtexProduct.productName,
      description: vtexProduct.description || '',
      price: commercialOffer?.Price || 0,
      stock: commercialOffer?.AvailableQuantity || 0,
      isActive: (commercialOffer?.AvailableQuantity || 0) > 0,
      imageUrl: firstImage?.imageUrl,
      tenantId,
      ecommerceProviderProductId: vtexProduct.productId,
    };
  }

  /**
   * Mapeia múltiplos produtos da VTEX para o formato local
   */
  mapVtexProductsToLocalProducts(vtexProducts: VtexProduct[], tenantId: string): Partial<Product>[] {
    return vtexProducts.map(product => this.mapVtexProductToLocalProduct(product, tenantId));
  }

  async mapEcommerceProductToLocalProduct(ecommerceProduct: any, tenantId: string, providerConfig?: any): Promise<Partial<Product>> {
    return this.mapVtexProductToLocalProduct(ecommerceProduct, tenantId);
  }
}