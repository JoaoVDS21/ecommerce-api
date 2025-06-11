import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantService } from '../../tenants/tenant.service';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private readonly tenantService: TenantService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not provided');
    }

    try {
      const { tenant, contract } = await this.tenantService.getTenantWithActiveContract(tenantId);
      
      // Attach tenant info to the request
      request.tenant = tenant;
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid tenant or tenant contract');
    }
  }
}