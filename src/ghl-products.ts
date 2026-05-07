import { GHLProduct } from './types';
import { GHL } from './ghl';

export class GHLProductsService {
  private ghl: GHL;

  constructor() {
    this.ghl = new GHL();
  }

  async getProducts(locationId: string): Promise<GHLProduct[]> {
    try {
      const response = await this.ghl.requests(locationId).get('/products/', {
        headers: {
          Version: '2021-07-28',
        },
      });

      return this.transformGHLProducts(response.data.products || []);
    } catch (error) {
      console.error('Error fetching GHL products:', error);
      throw error;
    }
  }

  async getProduct(locationId: string, productId: string): Promise<GHLProduct | null> {
    try {
      const response = await this.ghl.requests(locationId).get(`/products/${productId}`, {
        headers: {
          Version: '2021-07-28',
        },
      });

      return this.transformGHLProduct(response.data);
    } catch (error) {
      console.error('Error fetching GHL product:', error);
      return null;
    }
  }

  async bulkUpdateProducts(locationId: string, products: Partial<GHLProduct>[]): Promise<any> {
    try {
      const bulkData = products.map(product => ({
        id: product.id,
        price: product.price,
        inventory: product.inStock ? 1 : 0,
        ...(product.categories && { collections: product.categories })
      }));

      const response = await this.ghl.requests(locationId).post('/products/bulk', {
        headers: {
          Version: '2021-07-28',
        },
        data: bulkData
      });

      return response.data;
    } catch (error) {
      console.error('Error bulk updating GHL products:', error);
      throw error;
    }
  }

  private transformGHLProducts(products: any[]): GHLProduct[] {
    return products.map(product => this.transformGHLProduct(product)).filter(Boolean);
  }

  private transformGHLProduct(product: any): GHLProduct {
    return {
      id: product.id || '',
      name: product.name || '',
      description: product.description || '',
      price: parseFloat(product.price) || 0,
      currency: product.currency || 'USD',
      inStock: product.inventory > 0,
      imageUrl: product.imageUrl || product.image || '',
      url: product.url || '',
      brand: product.brand || '',
      sku: product.sku || '',
      gtin: product.gtin || '',
      categories: product.collections || product.categories || [],
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async validateProduct(product: GHLProduct): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!product.id) errors.push('Product ID is required');
    if (!product.name) errors.push('Product name is required');
    if (!product.price || product.price <= 0) errors.push('Valid price is required');
    if (!product.imageUrl) errors.push('Product image is required');
    
    return {
      valid: errors.length === 0,
      errors
    };
  }
}
