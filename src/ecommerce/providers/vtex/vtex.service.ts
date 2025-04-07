import { Injectable } from '@nestjs/common';
import { EcommerceProvider } from '../../../common/interfaces/ecommerce-provider.interface';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class VtexService implements EcommerceProvider {
  constructor(private readonly httpService: HttpService) {}

  private getConfig(tenantConfig: any) {
    return {
      baseUrl: tenantConfig.baseUrl || 'https://api.vtex.com',
      apiKey: tenantConfig.apiKey,
      apiToken: tenantConfig.apiToken,
    };
  }

  async listProducts(params: any = {}, tenantConfig?: any): Promise<any[]> {
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
    return response.data;
  }

  async getProduct(id: string, tenantConfig?: any): Promise<any> {
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
  }
}