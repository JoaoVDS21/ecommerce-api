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

  @Column({default: 0})
  stock: number;

  @ManyToMany(() => Shelf, (shelf) => shelf.products, {
    onDelete: 'CASCADE'
  })
  shelves: Shelf[]

  @ManyToMany(() => Category, (category) => category.products, {
    onDelete: 'CASCADE'
  })
  categories: Category[]
  
  @Column({nullable: true})
  tenantId: string;

  @ManyToOne(() => Tenant)
  @JoinColumn({ name: 'tenantId' })
  tenant: Tenant;

  @Column({ default: true })
  isActive: boolean;
  
  @Column({nullable: true})
  imageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}