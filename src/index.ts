/*you provided is a TypeScript code that sets up an Express server and defines several routes
for handling HTTP requests. */
import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import { GHL } from "./ghl";
import { GoogleMerchantCenter } from "./google-merchant";
import { GHLProductsService } from "./ghl-products";
import * as CryptoJS from 'crypto-js'
import { json } from "body-parser";

const path = __dirname + "/ui/dist/";

dotenv.config();
const app: Express = express();
app.use(json({ type: 'application/json' }))

/*`app.use(express.static(path));` is setting up a middleware in the Express server. The
`express.static` middleware is used to serve static files such as HTML, CSS, JavaScript, and images. */
app.use(express.static(path));

/* The line `const ghl = new GHL();` is creating a new instance of the `GHL` class. It is assigning
this instance to the variable `ghl`. This allows you to use the methods and properties defined in
the `GHL` class to interact with the GoHighLevel API. */
const ghl = new GHL();
const ghlProducts = new GHLProductsService();

const port = process.env.PORT;

/*`app.get("/authorize-handler", async (req: Request, res: Response) => { ... })` sets up an example how you can authorization requests */
app.get("/authorize-handler", async (req: Request, res: Response) => {
  const { code } = req.query;
  await ghl.authorizationHandler(code as string);
  res.redirect("https://app.gohighlevel.com/");
});

/*`app.get("/example-api-call", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/example-api-call", async (req: Request, res: Response) => {
  if (ghl.checkInstallationExists(req.query.companyId as string)) {
    try {
      const request = await ghl
        .requests(req.query.companyId as string)
        .get(`/users/search?companyId=${req.query.companyId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    } catch (error) {
      console.log(error);
    }
  }
  return res.send("Installation for this company does not exists");
});

/*`app.get("/example-api-call-location", async (req: Request, res: Response) => { ... })` shows you how you can use ghl object to make get requests
 ghl object in abstract would handle all of the authorization part over here. */
app.get("/example-api-call-location", async (req: Request, res: Response) => {
  /* The line `if(ghl.checkInstallationExists(req.params.locationId)){` is checking if an
    installation already exists for a specific location. It calls the `checkInstallationExists`
    method of the `GHL` class and passes the `locationId` as a parameter. This method checks if
    there is an existing installation for the provided locationId and returns a boolean value
    indicating whether the installation exists or not. */
  try {
    if (ghl.checkInstallationExists(req.params.locationId)) {
      const request = await ghl
        .requests(req.query.locationId as string)
        .get(`/contacts/?locationId=${req.query.locationId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    } else {
      /* NOTE: This flow would only work if you have a distribution type of both Location & Company & OAuth read-write scopes are configured. 
        The line `await ghl.getLocationTokenFromCompanyToken(req.query.companyId as string, req.query.locationId as string)`
         is calling the `getLocationTokenFromCompanyToken` method of the
        `GHL` class. This method is used to retrieve the location token for a specific location within a company. */
      await ghl.getLocationTokenFromCompanyToken(
        req.query.companyId as string,
        req.query.locationId as string
      );
      const request = await ghl
        .requests(req.query.locationId as string)
        .get(`/contacts/?locationId=${req.query.locationId}`, {
          headers: {
            Version: "2021-07-28",
          },
        });
      return res.send(request.data);
    }
  } catch (error) {
    console.log(error);
    res.send(error).status(400)
  }
});

/*`app.post("example-webhook-handler",async (req: Request, res: Response) => {
    console.log(req.body)
})` sets up a route for handling HTTP POST requests to the "/example-webhook-handler" endpoint. The below POST
api can be used to subscribe to various webhook events configured for the app. */
app.post("/example-webhook-handler",async (req: Request, res: Response) => {
    console.log(req.body)
})


/* Google Merchant Center Integration Routes */

app.post("/api/google-merchant/setup", async (req: Request, res: Response) => {
  const { locationId, merchantId, serviceAccountKey, autoSync = true } = req.body;
  
  if (!locationId || !merchantId || !serviceAccountKey) {
    return res.status(400).json({ error: "Missing required fields: locationId, merchantId, serviceAccountKey" });
  }

  try {
    if (!ghl.checkInstallationExists(locationId)) {
      return res.status(401).json({ error: "Installation not found for this location" });
    }

    const parsedServiceKey = typeof serviceAccountKey === 'string' ? JSON.parse(serviceAccountKey) : serviceAccountKey;
    const gmc = new GoogleMerchantCenter({ merchantId, serviceAccountKey: parsedServiceKey });
    
    // Test the connection by trying to list products
    await gmc.getProducts();
    
    // Store settings (in production, use proper database)
    const settings = {
      merchantId,
      serviceAccountKey: JSON.stringify(parsedServiceKey),
      autoSync,
      syncInterval: 60, // 1 hour default
      setupAt: new Date().toISOString()
    };

    res.json({ success: true, settings });
  } catch (error: any) {
    console.error('Google Merchant setup error:', error);
    res.status(500).json({ error: "Failed to setup Google Merchant Center", details: error.message });
  }
});

app.post("/api/google-merchant/sync", async (req: Request, res: Response) => {
  const { locationId, merchantId, serviceAccountKey } = req.body;
  
  if (!locationId || !merchantId || !serviceAccountKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    if (!ghl.checkInstallationExists(locationId)) {
      return res.status(401).json({ error: "Installation not found for this location" });
    }

    const parsedServiceKey = typeof serviceAccountKey === 'string' ? JSON.parse(serviceAccountKey) : serviceAccountKey;
    const gmc = new GoogleMerchantCenter({ merchantId, serviceAccountKey: parsedServiceKey });
    
    // Get GHL products
    const ghlProductsList = await ghlProducts.getProducts(locationId);
    
    const syncResults = {
      total: ghlProductsList.length,
      success: 0,
      failed: 0,
      errors: [] as string[]
    };

    // Sync each product
    for (const product of ghlProductsList) {
      try {
        const validation = await gmc.validateProduct(product);
        if (!validation.valid) {
          syncResults.failed++;
          syncResults.errors.push(`Product ${product.name}: ${validation.errors.join(', ')}`);
          continue;
        }

        await gmc.insertProduct(product);
        syncResults.success++;
      } catch (error: any) {
        syncResults.failed++;
        syncResults.errors.push(`Product ${product.name}: ${error.message}`);
      }
    }

    res.json({
      success: true,
      results: syncResults,
      lastSyncAt: new Date().toISOString()
    });
  } catch (error: any) {
    console.error('Google Merchant sync error:', error);
    res.status(500).json({ error: "Failed to sync products", details: error.message });
  }
});

app.get("/api/google-merchant/products", async (req: Request, res: Response) => {
  const { locationId, merchantId, serviceAccountKey } = req.query;
  
  if (!locationId || !merchantId || !serviceAccountKey) {
    return res.status(400).json({ error: "Missing required query parameters" });
  }

  try {
    if (!ghl.checkInstallationExists(locationId as string)) {
      return res.status(401).json({ error: "Installation not found for this location" });
    }

    const parsedServiceKey = typeof serviceAccountKey === 'string' ? JSON.parse(serviceAccountKey as string) : serviceAccountKey;
    const gmc = new GoogleMerchantCenter({ merchantId: merchantId as string, serviceAccountKey: parsedServiceKey });
    
    const products = await gmc.getProducts();
    res.json({ success: true, products });
  } catch (error: any) {
    console.error('Google Merchant products error:', error);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

app.post("/api/google-merchant/validate", async (req: Request, res: Response) => {
  const { locationId, product, merchantId, serviceAccountKey } = req.body;
  
  if (!locationId || !product || !merchantId || !serviceAccountKey) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const parsedServiceKey = typeof serviceAccountKey === 'string' ? JSON.parse(serviceAccountKey) : serviceAccountKey;
    const gmc = new GoogleMerchantCenter({ merchantId, serviceAccountKey: parsedServiceKey });
    
    const validation = await gmc.validateProduct(product);
    res.json({ success: true, validation });
  } catch (error: any) {
    console.error('Product validation error:', error);
    res.status(500).json({ error: "Failed to validate product", details: error.message });
  }
});

/* The `app.post("/decrypt-sso",async (req: Request, res: Response) => { ... })` route is used to
decrypt session details using ssoKey. */
app.post("/decrypt-sso",async (req: Request, res: Response) => {
  const {key} = req.body || {}
  if(!key){
    return res.status(400).send("Please send valid key")
  }
  try {
    const data = ghl.decryptSSOData(key)
    res.send(data)
  } catch (error) {
    res.status(400).send("Invalid Key")
    console.log(error)  
  }
})

/*`app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});` sets up a route for the root URL ("/") of the server.  This is
 used to serve the main HTML file of a web application. */
app.get("/", function (req, res) {
  res.sendFile(path + "index.html");
});

/*`app.listen(port, () => {
  console.log(`GHL app listening on port `);
});` is starting the Express server and making it listen on the specified port. */
app.listen(port, () => {
  console.log(`GHL app listening on port ${port}`);
});
