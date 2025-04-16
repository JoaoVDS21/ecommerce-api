import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductsModule } from './products/products.module';
import { TenantModule } from './tenants/tenant.module';
import { EcommerceModule } from './ecommerce/ecommerce.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ShelvesModule } from './shelves/shelves.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { BannersModule } from './banners/banners.module';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_DATABASE || 'multitenant',
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ProductsModule,
    TenantModule,
    EcommerceModule,
    UsersModule,
    AuthModule,
    CategoriesModule,
    ShelvesModule,
    BannersModule
  ],
})
export class AppModule {}