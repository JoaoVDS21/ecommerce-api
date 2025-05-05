import { Product } from "src/products/entities/product.entity";

export interface EcommerceProvider {
  listProducts(params: any | {}, tenantConfig: any): Promise<any[]>;
  getProduct(id: string, tenantConfig: any): Promise<any>;
  createProduct(product: any, tenantConfig: any): Promise<any>;
  updateProduct(id: string, product: any, tenantConfig: any): Promise<any>;
  deleteProduct(id: string, tenantConfig: any): Promise<boolean>;
  mapEcommerceProductToLocalProduct(ecommerceProducts: any, tenantId: string, tenantConfig: any): Promise<Partial<Product>>
}