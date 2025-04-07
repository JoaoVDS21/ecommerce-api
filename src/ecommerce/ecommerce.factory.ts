import { Injectable } from '@nestjs/common';
import { VtexService } from './providers/vtex/vtex.service';
import { UappiService } from './providers/uappi/uappi.service';
import { EcommerceProvider } from '../common/interfaces/ecommerce-provider.interface';
import { EcommerceProviderType } from '../tenants/entities/tenant-contract.entity';

@Injectable()
export class EcommerceFactory {
  constructor(
    private readonly vtexService: VtexService,
    private readonly uappiService: UappiService,
  ) {}

  getProvider(providerType: EcommerceProviderType, config: any): EcommerceProvider {
    switch (providerType) {
      case EcommerceProviderType.VTEX:
        return this.vtexService;
      case EcommerceProviderType.UAPPI:
        return this.uappiService;
      default:
        throw new Error(`Unsupported ecommerce provider: ${providerType}`);
    }
  }
}