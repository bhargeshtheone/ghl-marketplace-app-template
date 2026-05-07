<template>
  <div class="google-merchant-setup">
    <div class="header">
      <h2>🛍️ Google Merchant Center Integration</h2>
      <p>Connect your GHL store to Google Shopping for maximum visibility</p>
    </div>

    <div class="setup-form" v-if="!isConfigured">
      <div class="form-group">
        <label for="merchantId">Google Merchant Center ID</label>
        <input 
          type="text" 
          id="merchantId" 
          v-model="setupData.merchantId" 
          placeholder="Enter your Merchant Center ID"
          class="form-control"
        />
      </div>

      <div class="form-group">
        <label for="serviceAccountKey">Service Account Key (JSON)</label>
        <textarea 
          id="serviceAccountKey" 
          v-model="setupData.serviceAccountKey" 
          placeholder="Paste your service account key JSON here..."
          class="form-control"
          rows="8"
        ></textarea>
        <small class="help-text">
          Get this from your Google Cloud Console → IAM & Admin → Service Accounts
        </small>
      </div>

      <div class="form-group">
        <label class="checkbox-label">
          <input type="checkbox" v-model="setupData.autoSync" />
          Enable automatic product syncing
        </label>
      </div>

      <div class="form-actions">
        <button 
          @click="testConnection" 
          :disabled="isLoading" 
          class="btn btn-secondary"
        >
          {{ isLoading ? 'Testing...' : 'Test Connection' }}
        </button>
        <button 
          @click="saveSetup" 
          :disabled="isLoading || !isValid" 
          class="btn btn-primary"
        >
          {{ isLoading ? 'Setting up...' : 'Setup Integration' }}
        </button>
      </div>

      <div v-if="connectionStatus" :class="['alert', connectionStatus.type]">
        {{ connectionStatus.message }}
      </div>
    </div>

    <div class="configured-view" v-else>
      <div class="success-message">
        <h3>✅ Google Merchant Center Connected!</h3>
        <p>Your store is connected to Merchant ID: {{ config.merchantId }}</p>
      </div>

      <div class="sync-section">
        <h4>Product Syncing</h4>
        <div class="sync-controls">
          <button 
            @click="syncProducts" 
            :disabled="isSyncing" 
            class="btn btn-primary"
          >
            {{ isSyncing ? 'Syncing...' : 'Sync Products Now' }}
          </button>
          <button 
            @click="viewProducts" 
            class="btn btn-secondary"
          >
            View Synced Products
          </button>
        </div>

        <div v-if="syncStatus" class="sync-status">
          <h5>Last Sync Results:</h5>
          <div class="sync-stats">
            <span class="stat success">✅ {{ syncStatus.success }} synced</span>
            <span class="stat failed">❌ {{ syncStatus.failed }} failed</span>
            <span class="stat total">📦 {{ syncStatus.total }} total</span>
          </div>
          <div v-if="syncStatus.errors.length > 0" class="error-list">
            <h6>Errors:</h6>
            <ul>
              <li v-for="error in syncStatus.errors.slice(0, 5)" :key="error">{{ error }}</li>
            </ul>
          </div>
        </div>
      </div>

      <div class="actions">
        <button @click="resetSetup" class="btn btn-danger">
          Disconnect
        </button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'GoogleMerchantSetup',
  data() {
    return {
      isConfigured: false,
      isLoading: false,
      isSyncing: false,
      setupData: {
        merchantId: '',
        serviceAccountKey: '',
        autoSync: true
      },
      config: null,
      connectionStatus: null,
      syncStatus: null
    }
  },
  computed: {
    isValid() {
      return this.setupData.merchantId && 
             this.setupData.serviceAccountKey &&
             this.isJsonValid(this.setupData.serviceAccountKey);
    }
  },
  methods: {
    isJsonValid(str) {
      try {
        JSON.parse(str);
        return true;
      } catch {
        return false;
      }
    },
    
    async testConnection() {
      this.isLoading = true;
      this.connectionStatus = null;
      
      try {
        const response = await fetch('/api/google-merchant/products', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: await this.getLocationId(),
            merchantId: this.setupData.merchantId,
            serviceAccountKey: this.setupData.serviceAccountKey
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.connectionStatus = {
            type: 'success',
            message: '✅ Connection successful! Your Google Merchant Center is accessible.'
          };
        } else {
          this.connectionStatus = {
            type: 'error',
            message: `❌ Connection failed: ${data.error}`
          };
        }
      } catch (error) {
        this.connectionStatus = {
          type: 'error',
          message: `❌ Connection failed: ${error.message}`
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    async saveSetup() {
      this.isLoading = true;
      
      try {
        const response = await fetch('/api/google-merchant/setup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: await this.getLocationId(),
            ...this.setupData
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.config = data.settings;
          this.isConfigured = true;
          this.connectionStatus = {
            type: 'success',
            message: '✅ Setup completed successfully!'
          };
        } else {
          this.connectionStatus = {
            type: 'error',
            message: `❌ Setup failed: ${data.error}`
          };
        }
      } catch (error) {
        this.connectionStatus = {
          type: 'error',
          message: `❌ Setup failed: ${error.message}`
        };
      } finally {
        this.isLoading = false;
      }
    },
    
    async syncProducts() {
      this.isSyncing = true;
      this.syncStatus = null;
      
      try {
        const response = await fetch('/api/google-merchant/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            locationId: await this.getLocationId(),
            merchantId: this.config.merchantId,
            serviceAccountKey: this.config.serviceAccountKey
          })
        });
        
        const data = await response.json();
        
        if (response.ok) {
          this.syncStatus = data.results;
        } else {
          this.syncStatus = {
            total: 0,
            success: 0,
            failed: 1,
            errors: [data.error]
          };
        }
      } catch (error) {
        this.syncStatus = {
          total: 0,
          success: 0,
          failed: 1,
          errors: [error.message]
        };
      } finally {
        this.isSyncing = false;
      }
    },
    
    async viewProducts() {
      // Open products view or navigate to products page
      console.log('View products clicked');
    },
    
    resetSetup() {
      this.isConfigured = false;
      this.config = null;
      this.setupData = {
        merchantId: '',
        serviceAccountKey: '',
        autoSync: true
      };
      this.connectionStatus = null;
      this.syncStatus = null;
    },
    
    async getLocationId() {
      // Get location ID from GHL context
      const userData = await window.ghl.getUserData();
      return userData.locationId;
    }
  }
}
</script>

<style scoped>
.google-merchant-setup {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  color: #2c3e50;
  margin-bottom: 10px;
}

.header p {
  color: #666;
  font-size: 16px;
}

.setup-form {
  background: #f8f9fa;
  padding: 30px;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-control:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.help-text {
  display: block;
  margin-top: 5px;
  color: #666;
  font-size: 12px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 12px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #545b62;
}

.btn-danger {
  background: #dc3545;
  color: white;
}

.btn-danger:hover {
  background: #c82333;
}

.alert {
  padding: 12px;
  border-radius: 4px;
  margin-top: 15px;
}

.alert.success {
  background: #d4edda;
  color: #155724;
  border: 1px solid #c3e6cb;
}

.alert.error {
  background: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
}

.configured-view {
  text-align: center;
}

.success-message {
  background: #d4edda;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
}

.sync-section {
  background: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.sync-controls {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 20px;
}

.sync-status {
  text-align: left;
  background: white;
  padding: 15px;
  border-radius: 4px;
  border: 1px solid #e9ecef;
}

.sync-stats {
  display: flex;
  gap: 15px;
  margin-bottom: 10px;
}

.stat {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.stat.success {
  background: #d4edda;
  color: #155724;
}

.stat.failed {
  background: #f8d7da;
  color: #721c24;
}

.stat.total {
  background: #d1ecf1;
  color: #0c5460;
}

.error-list {
  margin-top: 10px;
}

.error-list ul {
  margin: 0;
  padding-left: 20px;
}

.error-list li {
  font-size: 12px;
  color: #721c24;
  margin-bottom: 5px;
}
</style>
