import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Tenant } from 'src/tenants/entities/tenant.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string, tenantId?: string): Promise<any> {
    const user = await this.usersService.findByEmail(email);
    
    if (user && await bcrypt.compare(password, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto, tenantId: string): Promise<User> {
    return this.usersService.create({
      ...registerDto,
      tenantId,
    });
  }

  async login(loginDto: LoginDto, tenant: Tenant): Promise<{ access_token: string; user: any }> {
    const isValidLogin = await this.validateUser(loginDto.email, loginDto.password, tenant?.id)

    if(!isValidLogin) {
      throw new BadRequestException('Credenciais inválidas.')
    }
    
    const payload = { 
      sub: isValidLogin.id, 
      email: isValidLogin.email,
      tenantId: isValidLogin.tenantId,
      role: isValidLogin.role
    };
    
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: isValidLogin.id,
        email: isValidLogin.email,
        firstName: isValidLogin.firstName,
        lastName: isValidLogin.lastName,
        role: isValidLogin.role,
        tenantId: isValidLogin.tenantId,
      },
    };
  }
}