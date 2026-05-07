# Google Merchant Center Integration for GoHighLevel

## Overview

This plugin enables seamless integration between GoHighLevel stores and Google Merchant Center, allowing businesses to automatically sync their products to Google Shopping for maximum visibility and sales opportunities.

## Features

- ✅ **Product Syncing**: Automatically sync GHL products to Google Merchant Center
- ✅ **Real-time Updates**: Keep product information up-to-date across platforms
- ✅ **Validation**: Ensure products meet Google Shopping requirements
- ✅ **Error Handling**: Detailed error reporting and troubleshooting
- ✅ **Auto-sync**: Scheduled automatic syncing (configurable intervals)
- ✅ **Bulk Operations**: Efficient bulk product updates
- ✅ **Multi-channel Support**: Ready for expansion to other platforms (Bing, Facebook, etc.)

## Prerequisites

### Required Accounts

1. **GoHighLevel Unlimited Plan** ($297/month)
   - Required for API access
   - Rate limits: 100 bursts/10s, 200k/day

2. **Google Merchant Center Account**
   - Free Google account
   - Verified business website
   - Product feed compliance

3. **Google Cloud Project**
   - Service account with Content API access
   - OAuth 2.0 credentials

### Google Cloud Setup

1. Create a new Google Cloud project
2. Enable the **Content API for Shopping**
3. Create a Service Account:
   - Go to IAM & Admin → Service Accounts
   - Create new service account
   - Download JSON key file
4. Grant permissions:
   - Add service account to Google Merchant Center
   - Assign "Content API" permissions

## Installation

### 1. Clone and Setup

```bash
git clone https://github.com/your-username/ghl-google-merchant-plugin.git
cd ghl-google-merchant-plugin
npm install
```

### 2. Environment Configuration

Create `.env` file:

```env
GHL_APP_CLIENT_ID=your_ghl_client_id
GHL_APP_CLIENT_SECRET=your_ghl_client_secret
GHL_APP_SSO_KEY=your_ghl_sso_key
GHL_API_DOMAIN=https://services.leadconnectorhq.com
PORT=3000
```

### 3. Build and Run

```bash
# Build the UI
npm run build-ui

# Start development server
npm run dev
```

## API Endpoints

### Setup Integration
```
POST /api/google-merchant/setup
```

**Body:**
```json
{
  "locationId": "your_location_id",
  "merchantId": "your_merchant_center_id",
  "serviceAccountKey": "service_account_json",
  "autoSync": true
}
```

### Sync Products
```
POST /api/google-merchant/sync
```

**Body:**
```json
{
  "locationId": "your_location_id",
  "merchantId": "your_merchant_center_id",
  "serviceAccountKey": "service_account_json"
}
```

### Get Synced Products
```
GET /api/google-merchant/products?locationId=xxx&merchantId=xxx&serviceAccountKey=xxx
```

### Validate Product
```
POST /api/google-merchant/validate
```

**Body:**
```json
{
  "locationId": "your_location_id",
  "product": { ... },
  "merchantId": "your_merchant_center_id",
  "serviceAccountKey": "service_account_json"
}
```

## Product Mapping

| GHL Field | Google Merchant Field | Notes |
|-----------|---------------------|-------|
| id | offerId | Unique product identifier |
| name | title | Product name (max 150 chars) |
| description | description | Product description (max 5000 chars) |
| price | price.value | Product price |
| currency | price.currency | Currency code (USD, EUR, etc.) |
| inStock | availability | "in stock" or "out of stock" |
| imageUrl | imageLink | Product image URL |
| url | link | Product page URL |
| brand | brand | Brand name |
| sku | mpn | Manufacturer Part Number |
| gtin | gtin | Global Trade Item Number |
| categories | productTypes | Product categories |

## Webhook Integration

Set up webhooks for real-time updates:

1. **Product Created**: Automatically add to Google Merchant Center
2. **Product Updated**: Sync changes to Google Merchant Center
3. **Product Deleted**: Remove from Google Merchant Center
4. **Inventory Changed**: Update availability status

### Webhook Configuration

In your GHL app settings, add webhook URL:
```
https://your-app-domain.com/webhooks/product-update
```

## Error Handling

### Common Issues

1. **Authentication Errors**
   - Check service account permissions
   - Verify Merchant Center access

2. **Product Validation Errors**
   - Missing required fields
   - Image issues (size, format)
   - Price formatting

3. **API Rate Limits**
   - Implement exponential backoff
   - Batch operations for efficiency

### Error Response Format

```json
{
  "success": false,
  "error": "Error message",
  "details": "Detailed error information",
  "code": "ERROR_CODE"
}
```

## Deployment

### Render Deployment

1. Connect repository to Render
2. Set environment variables
3. Configure build command: `npm install && npm run build`
4. Set start command: `npm start`

### Environment Variables for Production

```env
GHL_APP_CLIENT_ID=prod_client_id
GHL_APP_CLIENT_SECRET=prod_client_secret
GHL_APP_SSO_KEY=prod_sso_key
GHL_API_DOMAIN=https://services.leadconnectorhq.com
PORT=3000
NODE_ENV=production
```

## Security Considerations

1. **Service Account Keys**: Store securely, never expose in frontend
2. **API Keys**: Use environment variables
3. **Data Validation**: Validate all input data
4. **Rate Limiting**: Implement proper rate limiting
5. **Logging**: Monitor for suspicious activity

## Monitoring and Analytics

### Key Metrics to Track

- Sync success rates
- Product validation errors
- API response times
- Error frequency by type
- Active installations

### Recommended Tools

- Google Cloud Monitoring
- Log aggregation (ELK stack)
- Error tracking (Sentry)
- Performance monitoring (New Relic)

## Support

### Troubleshooting Steps

1. Check Google Cloud permissions
2. Verify Merchant Center setup
3. Review API logs
4. Test with single product first
5. Check product data completeness

### Common Solutions

- **"Access Denied"**: Update service account permissions
- **"Invalid Product"**: Check required fields
- **"Rate Limit Exceeded"**: Implement batching
- **"Image Not Found"**: Verify image URLs are accessible

## Future Enhancements

- [ ] Multi-channel support (Bing Shopping, Facebook Shops)
- [ ] Advanced product mapping customization
- [ ] Performance analytics dashboard
- [ ] Bulk product editing
- [ ] Automated optimization suggestions
- [ ] Integration with Google Ads

## Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Add tests
5. Submit pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create GitHub issue
- Email: support@yourcompany.com
- Documentation: [Link to docs]

---

**Note**: This plugin requires proper setup of Google Merchant Center and Google Cloud services. Ensure all prerequisites are met before installation.
