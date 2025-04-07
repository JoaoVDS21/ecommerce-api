import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findOne(id: string, tenantId?: string): Promise<User> {
    const options: any = { id };

    if (tenantId) {
      options.tenantId = tenantId;
    }
    
    const user = await this.usersRepository.findOne({ where: options });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }
    
    return user;
  }

  async findByEmail(email: string, tenantId?: string): Promise<User | null> {
    const options: any = { email };

    if (tenantId) {
      options.tenantId = tenantId;
    }
    
    return this.usersRepository.findOne({ where: options });
  }

  async create(userData: Partial<User>): Promise<User> {
    if(!userData?.email) {
      throw new BadRequestException('Invalid e-mail');
    }
    
    const existingUser = await this.findByEmail(userData.email, userData.tenantId);

    if (existingUser) {
      throw new ConflictException('Email already in use for this tenant');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 10);

    const user = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
    });

    return this.usersRepository.save(user);
  }
}