import { Injectable } from '@nestjs/common';
import { EcommerceProvider } from '../../../common/interfaces/ecommerce-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class UappiService implements EcommerceProvider {
  constructor(private readonly httpService: HttpService) {}

  private getConfig(tenantConfig: any) {
    return {
      baseUrl: tenantConfig.baseUrl || 'https://api.uappi.com',
      apiKey: tenantConfig.apiKey,
    };
  }

  async listProducts(params?: any, tenantConfig?: any): Promise<any[]> {
    const config = this.getConfig(tenantConfig);
    const response = await firstValueFrom(
      this.httpService.get(`${config.baseUrl}/v2/products`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
        params,
      })
    );
    return response.data.products;
  }

  async getProduct(id: string, tenantConfig?: any): Promise<any> {
    const config = this.getConfig(tenantConfig);
    const response = await firstValueFrom(
      this.httpService.get(`${config.baseUrl}/v2/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      })
    );
    return response.data;
  }

  async createProduct() {}

  async updateProduct() {}

  async deleteProduct(id: string, tenantConfig: any) { return null as any}

  async mapEcommerceProductToLocalProduct(ecommerceProduct: any, tenantId: string, tenantConfig: any): Promise<Partial<Product>> {
    return {
      name: ecommerceProduct.name || ecommerceProduct.title || '',
      description: ecommerceProduct.description || ecommerceProduct.details || '',
      price: ecommerceProduct.price || ecommerceProduct.basePrice || 0,
      stock: ecommerceProduct.availableQuantity || ecommerceProduct.stock || 0,
      imageUrl: ecommerceProduct.imageUrl || ecommerceProduct.mainImage || '',
      tenantId,
      isActive: true
    };
  }

  mapProductToLocalProduct
}