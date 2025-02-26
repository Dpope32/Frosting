# Proxy Server for Web Development

## Overview

This project includes a proxy server to handle CORS issues when running the web version of the app. The proxy server provides endpoints for:

1. **Stoic Quotes API** - Proxies requests to the Stoic Quotes API
2. **Yahoo Finance API** - Proxies requests to Yahoo Finance for stock data
3. **Network Ping** - Provides a ping endpoint for network speed testing

## Why a Proxy Server?

When running the app in a web browser, direct API calls to external services often fail due to CORS (Cross-Origin Resource Sharing) restrictions. The proxy server acts as a middleware that:

- Adds the necessary CORS headers to responses
- Forwards requests to external APIs
- Returns the data to the web app

## Running the App with Proxy Server

### Option 1: All-in-One Development Script (Recommended)

We've created a convenient script that starts both the proxy server and the web app together:

```bash
# Using npm
npm run web-dev

# Using yarn
yarn web-dev
```

This script:
1. Starts the proxy server
2. Waits for it to initialize
3. Starts the web app
4. Provides a clean shutdown of both when you press Ctrl+C

### Option 2: Manual Start

If you prefer to run the servers separately:

1. Start the proxy server:
   ```bash
   # Using npm
   npm run proxy
   
   # Using yarn
   yarn proxy
   
   # Or directly
   node proxyServer.js
   ```

2. In a separate terminal, start the web app:
   ```bash
   # Using npm
   npm run web
   
   # Using yarn
   yarn web
   ```

## Proxy Server Endpoints

The proxy server runs on port 3000 by default and provides the following endpoints:

- `GET /api/stoic-quote` - Proxies requests to https://stoic.tekloon.net/stoic-quote
- `GET /api/yahoo-finance/:symbol` - Proxies requests to Yahoo Finance API for stock data
- `GET /api/ping` - Simple endpoint for network speed testing

## Automatic Fallback

The app includes a `ProxyServerManager` utility that:

1. Automatically detects if the proxy server is running
2. Uses the proxy server when available
3. Falls back to direct API calls when the proxy server is not running (though these may fail due to CORS)
4. Provides helpful console messages about proxy server status

## Production Considerations

The proxy server is intended for development use only. In a production environment, you would typically:

1. Configure your backend to handle these API requests
2. Use a production-ready proxy solution (like Nginx, Cloudflare Workers, or AWS API Gateway)
3. Implement proper caching and error handling

## Troubleshooting

If you encounter issues with the proxy server:

1. Check that port 3000 is not already in use by another application
2. Verify that the proxy server is running by visiting http://localhost:3000/api/ping in your browser
3. Check the console for error messages
4. Ensure you have the required dependencies installed (`express`, `cors`, `axios`)
