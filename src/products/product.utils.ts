import { Product } from './entities/product.entity';

export class ProductUtils {
  /**
   * Verifica se um produto é local (já foi integrado/sincronizado)
   */
  static isLocalProduct(product: Product): boolean {
    return product.id !== undefined && product.id > 0;
  }

  /**
   * Verifica se um produto veio do ecommerce (ainda não foi integrado)
   */
  static isEcommerceProduct(product: Product): boolean {
    return !this.isLocalProduct(product) && !!product.ecommerceProviderProductId;
  }

  /**
   * Verifica se um produto local está sincronizado com o ecommerce
   */
  static isSyncedProduct(product: Product): boolean {
    return this.isLocalProduct(product) && !!product.ecommerceProviderProductId;
  }

  /**
   * Verifica se um produto local é apenas local (não tem correspondente no ecommerce)
   */
  static isLocalOnlyProduct(product: Product): boolean {
    return this.isLocalProduct(product) && !product.ecommerceProviderProductId;
  }

  /**
   * Adiciona metadata aos produtos para facilitar identificação no frontend
   */
  static addProductMetadata(product: Product): Product & { 
    _metadata: {
      isLocal: boolean;
      isEcommerce: boolean;
      isSynced: boolean;
      isLocalOnly: boolean;
    }
  } {
    return {
      ...product,
      _metadata: {
        isLocal: this.isLocalProduct(product),
        isEcommerce: this.isEcommerceProduct(product),
        isSynced: this.isSyncedProduct(product),
        isLocalOnly: this.isLocalOnlyProduct(product),
      }
    };
  }

  /**
   * Adiciona metadata a uma lista de produtos
   */
  static addProductsMetadata(products: Product[]): Array<Product & { 
    _metadata: {
      isLocal: boolean;
      isEcommerce: boolean;
      isSynced: boolean;
      isLocalOnly: boolean;
    }
  }> {
    return products.map(product => this.addProductMetadata(product));
  }
}