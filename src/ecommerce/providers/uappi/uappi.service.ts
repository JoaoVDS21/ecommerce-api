import { Injectable } from '@nestjs/common';
import { EcommerceProvider } from '../../../common/interfaces/ecommerce-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

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
      this.httpService.get(`${config.baseUrl}/v1/products`, {
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
      this.httpService.get(`${config.baseUrl}/v1/products/${id}`, {
        headers: {
          'Authorization': `Bearer ${config.apiKey}`,
        },
      })
    );
    return response.data;
  }
}