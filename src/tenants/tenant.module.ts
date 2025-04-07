import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TenantService } from './tenant.service';
import { Tenant } from './entities/tenant.entity';
import { TenantContract } from './entities/tenant-contract.entity';

@Global()
@Module({
  imports: [TypeOrmModule.forFeature([Tenant, TenantContract])],
  providers: [TenantService],
  exports: [TenantService],
})
export class TenantModule {}