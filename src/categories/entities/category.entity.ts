import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany, JoinTable } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Product } from 'src/products/entities/product.entity';

@Entity()
export class Category {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string; 

  @Column({nullable: true})
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ default: true })
  isActive: boolean;
  
  @ManyToMany(() => Product, (product) => product.shelves, {
    cascade: true,
    onDelete: 'CASCADE'
  })
  @JoinTable()
  products: Product[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}