import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { TenantService } from '../../tenants/tenant.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthTenantGuard implements CanActivate {
  constructor(
    private readonly tenantService: TenantService,
    private readonly jwtService: JwtService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const tenantId = request.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not provided');
    }

    // Extract and validate JWT token
    try {
      const authHeader = request.headers.authorization;
      const token = authHeader?.split(' ')[1];
      
      if (!token) {
        throw new UnauthorizedException('Authentication token not provided');
      }
      
      const payload = this.jwtService.verify(token);
      
      // Optional: Check if user belongs to the specified tenant
      if (payload.tenantId !== tenantId && payload.role !== 'super_admin') {
        throw new UnauthorizedException('User does not have access to this tenant');
      }
      
      // Attach user info to request
      request.user = payload;
    } catch (error) {
      throw new UnauthorizedException('Invalid authentication token');
    }

    // Validate tenant and get tenant info
    try {
      const { tenant, contract } = await this.tenantService.getTenantWithActiveContract(tenantId);
      
      // Attach tenant info to request
      request.tenant = {
        id: tenant.id,
        name: tenant.name,
        contractId: contract.id,
        providerType: contract.ecommerceProvider,
        config: contract.config,
      };
      
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid tenant or tenant contract');
    }
  }
}