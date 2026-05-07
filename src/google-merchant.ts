import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import { GHLProduct } from './types';

export interface GoogleMerchantConfig {
  merchantId: string;
  serviceAccountKey: any;
}

export class GoogleMerchantCenter {
  private content: any;
  private merchantId: string;

  constructor(config: GoogleMerchantConfig) {
    this.merchantId = config.merchantId;
    
    const auth = new JWT({
      email: config.serviceAccountKey.client_email,
      key: config.serviceAccountKey.private_key,
      scopes: ['https://www.googleapis.com/auth/content']
    });

    this.content = google.content({ version: 'v2.1', auth });
  }

  async insertProduct(product: GHLProduct): Promise<any> {
    try {
      const googleProduct = this.mapProductToGoogleFormat(product);
      
      const response = await this.content.products.insert({
        merchantId: this.merchantId,
        requestBody: googleProduct
      });

      return response.data;
    } catch (error) {
      console.error('Error inserting product to Google Merchant Center:', error);
      throw error;
    }
  }

  async updateProduct(productId: string, product: GHLProduct): Promise<any> {
    try {
      const googleProduct = this.mapProductToGoogleFormat(product);
      
      const response = await this.content.products.update({
        merchantId: this.merchantId,
        productId: productId,
        requestBody: googleProduct
      });

      return response.data;
    } catch (error) {
      console.error('Error updating product in Google Merchant Center:', error);
      throw error;
    }
  }

  async deleteProduct(productId: string): Promise<any> {
    try {
      const response = await this.content.products.delete({
        merchantId: this.merchantId,
        productId: productId
      });

      return response.data;
    } catch (error) {
      console.error('Error deleting product from Google Merchant Center:', error);
      throw error;
    }
  }

  async getProducts(): Promise<any[]> {
    try {
      const response = await this.content.products.list({
        merchantId: this.merchantId
      });

      return response.data.resources || [];
    } catch (error) {
      console.error('Error fetching products from Google Merchant Center:', error);
      throw error;
    }
  }

  private mapProductToGoogleFormat(product: GHLProduct): any {
    return {
      offerId: product.id,
      title: product.name,
      description: product.description || '',
      link: product.url || '',
      imageLink: product.imageUrl || '',
      availability: product.inStock ? 'in stock' : 'out of stock',
      price: {
        value: product.price.toString(),
        currency: product.currency || 'USD'
      },
      brand: product.brand || '',
      gtin: product.gtin || '',
      mpn: product.sku || '',
      condition: 'new',
      productTypes: product.categories || []
    };
  }

  async validateProduct(product: GHLProduct): Promise<{ valid: boolean; errors: string[] }> {
    const errors: string[] = [];
    
    if (!product.name) errors.push('Product name is required');
    if (!product.price || product.price <= 0) errors.push('Valid price is required');
    if (!product.imageUrl) errors.push('Product image is required');
    if (!product.url) errors.push('Product URL is required');
    
    const googleProduct = this.mapProductToGoogleFormat(product);
    
    try {
      // Try to validate the product structure
      if (!googleProduct.offerId) errors.push('Product ID is required');
      if (!googleProduct.title || googleProduct.title.length > 150) errors.push('Title must be 150 characters or less');
      if (!googleProduct.description || googleProduct.description.length > 5000) errors.push('Description must be 5000 characters or less');
    } catch (error) {
      errors.push('Product validation failed');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
