import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { TenantContract } from './entities/tenant-contract.entity';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private tenantRepository: Repository<Tenant>,
    @InjectRepository(TenantContract)
    private contractRepository: Repository<TenantContract>,
  ) {}

  async getTenantWithActiveContract(tenantId: string): Promise<{ tenant: Tenant; contract: TenantContract }> {
    const tenant = await this.tenantRepository.findOne({
      where: { id: tenantId, isActive: true },
      relations: ['contracts'],
    });

    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${tenantId} not found or inactive`);
    }

    // We're assuming each tenant has only one active contract
    const contract = tenant.contracts[0];
    
    if (!contract) {
      throw new NotFoundException(`No active contract found for tenant ${tenantId}`);
    }

    return { tenant, contract };
  }
}