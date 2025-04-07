import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToOne, ManyToMany } from 'typeorm';
import { Tenant } from '../../tenants/entities/tenant.entity';
import { Shelf } from 'src/shelves/entities/shelf.entity';
import { Category } from 'src/categories/entities/category.entity';

@Entity()
export class Product {
  @PrimaryGeneratedColumn('increment')
  id: number;

  @Column()
  name: string;

  @Column({type: 'decimal', precision: 10, scale: 2, nullable: true})
  price: number;

  @Column({type: 'text'})
  description: string; 

  @ManyToMany(() => Shelf, (shelf) => shelf.products, {
    onDelete: 'CASCADE'
  })
  shelves: Shelf[]
  
  @Column({nullable: true})
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}