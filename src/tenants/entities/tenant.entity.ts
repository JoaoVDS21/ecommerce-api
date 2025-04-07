import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TenantContract } from './tenant-contract.entity';

@Entity()
export class Tenant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => TenantContract, contract => contract.tenant)
  contracts: TenantContract[];
}