# Google Merchant Center Plugin - Deployment Guide

## 🚀 Quick Start

### 1. Development Setup
```bash
# Clone the repository
git clone https://github.com/your-repo/ghl-google-merchant-plugin.git
cd ghl-google-merchant-plugin

# Install dependencies
npm install
cd src/ui && npm install && cd ../../

# Build the UI
cd src/ui && npm run build && cd ../../

# Start development server
npm run dev
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

### 3. Google Cloud Setup (Required)
1. Create Google Cloud Project
2. Enable Content API for Shopping
3. Create Service Account
4. Download JSON key
5. Add service account to Google Merchant Center

## 📦 Production Deployment

### Render.com (Recommended)

1. **Connect Repository**
   - Sign up at [Render](https://render.com)
   - Connect your GitHub repository

2. **Configure Web Service**
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free (for testing) or Standard

3. **Environment Variables**
   ```
   GHL_APP_CLIENT_ID=prod_client_id
   GHL_APP_CLIENT_SECRET=prod_client_secret
   GHL_APP_SSO_KEY=prod_sso_key
   GHL_API_DOMAIN=https://services.leadconnectorhq.com
   PORT=3000
   NODE_ENV=production
   ```

4. **Deploy**
   - Push to GitHub → Auto-deployment
   - Manual deploy available

### Heroku Alternative

```bash
# Install Heroku CLI
heroku create your-app-name
heroku config:set GHL_APP_CLIENT_ID=your_id
heroku config:set GHL_APP_CLIENT_SECRET=your_secret
heroku config:set GHL_APP_SSO_KEY=your_sso_key
heroku config:set GHL_API_DOMAIN=https://services.leadconnectorhq.com
git push heroku main
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY src ./src
RUN npm run build

EXPOSE 3000
CMD ["npm", "start"]
```

```bash
docker build -t ghl-google-merchant .
docker run -p 3000:3000 ghl-google-merchant
```

## 🔧 GHL Marketplace Submission

### 1. App Configuration
- **Name**: Google Merchant Center Integration
- **Description**: Sync GHL products to Google Shopping automatically
- **Category**: E-commerce
- **Pricing**: $29.99/month (suggested)

### 2. OAuth Setup
- Redirect URL: `https://your-domain.com/authorize-handler`
- Scopes: `products.read`, `products.write`, `locations.read`
- Distribution: Location & Company

### 3. Webhook Setup
- URL: `https://your-domain.com/webhooks/product-update`
- Events: Product Created, Updated, Deleted

### 4. Custom Pages
- Main Page: Google Merchant Center Setup UI
- Settings: Configuration management
- Dashboard: Sync status and analytics

## 📋 Testing Checklist

### Pre-Deployment Tests
- [ ] Google Cloud service account works
- [ ] Google Merchant Center access verified
- [ ] GHL API authentication successful
- [ ] Product sync functionality works
- [ ] Error handling tested
- [ ] UI renders correctly

### Post-Deployment Tests
- [ ] Webhook endpoints respond
- [ ] OAuth flow completes
- [ ] Real product sync works
- [ ] Error logging functional
- [ ] Performance acceptable

## 🛠️ Troubleshooting

### Common Issues

1. **"Installation not found"**
   - Check GHL app scopes
   - Verify redirect URL matches
   - Ensure proper OAuth flow

2. **"Google API access denied"**
   - Verify service account permissions
   - Check Content API is enabled
   - Confirm Merchant Center access

3. **"Build fails"**
   - Clear node_modules: `rm -rf node_modules && npm install`
   - Check Node.js version (18+ recommended)
   - Verify environment variables

4. **"Product sync fails"**
   - Check product data completeness
   - Verify image URLs are accessible
   - Review Google Shopping policies

### Logging Setup

```javascript
// Add to index.ts for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

## 📊 Monitoring

### Key Metrics
- Sync success rate
- API response times
- Error frequency
- Active installations

### Monitoring Tools
- Render Logs (built-in)
- Google Cloud Monitoring
- Sentry for error tracking

## 🔒 Security Best Practices

1. **Never expose service account keys in frontend**
2. **Use environment variables for all secrets**
3. **Implement rate limiting**
4. **Validate all input data**
5. **Monitor for suspicious activity**

## 📞 Support

### Documentation
- Full API documentation: `/docs`
- Setup guide: `GOOGLE_MERCHANT_README.md`
- Troubleshooting: Check logs first

### Contact
- GitHub Issues: Report bugs
- Email: support@yourcompany.com
- Documentation: [Link to docs]

---

**Ready to launch!** 🎉

Your Google Merchant Center integration is now ready for the GHL Marketplace. Follow this guide for a smooth deployment process.
