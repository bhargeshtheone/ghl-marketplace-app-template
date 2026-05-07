export interface GHLProduct {
  id: string;
  name: string;
  description?: string;
  price: number;
  currency?: string;
  inStock: boolean;
  imageUrl?: string;
  url?: string;
  brand?: string;
  sku?: string;
  gtin?: string;
  categories?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GHLInstallation {
  companyId: string;
  locationId?: string;
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface GoogleMerchantSettings {
  merchantId: string;
  serviceAccountKey: string;
  autoSync: boolean;
  syncInterval: number; // in minutes
  lastSyncAt?: string;
}

export interface SyncStatus {
  totalProducts: number;
  syncedProducts: number;
  failedProducts: number;
  lastSyncAt?: string;
  errors: string[];
}
