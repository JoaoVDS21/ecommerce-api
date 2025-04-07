import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Tenant } from './tenant.entity';

export enum EcommerceProviderType {
  VTEX = 'vtex',
  UAPPI = 'uappi'
}

@Entity()
export class TenantContract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: EcommerceProviderType,
  })
  ecommerceProvider: EcommerceProviderType;

  @Column({ type: 'json' })
  config: Record<string, any>;

  @Column()
  tenantId: string;

  @ManyToOne(() => Tenant, tenant => tenant.contracts)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;
}