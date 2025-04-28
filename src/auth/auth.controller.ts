import { Controller, Post, Body, UseGuards, Get, Request, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { TenantGuard } from 'src/common/guards/tenant.guard';
import { CurrentTenant } from 'src/common/decorators/tenant.decorator';
import { Tenant } from 'src/tenants/entities/tenant.entity';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterDto,
    @Request() req,
  ) {
    const tenantId = req.headers['x-tenant-id'];

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID not provided');
    }
    
    const user = await this.authService.register(registerDto, tenantId);

    const { password, ...result } = user;

    return result;
  }

  @Post('login')
  // @UseGuards(TenantGuard)
  async login(@Body() loginDto: LoginDto, @CurrentTenant() tenant: Tenant) {
    return this.authService.login(loginDto, tenant);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user) {
    return user;
  }
}