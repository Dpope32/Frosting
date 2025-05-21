import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ['GET', 'OPTIONS'],
});

// Define a common User-Agent header that mimics a regular browser
const BROWSER_USER_AGENT = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

// Add more browser-like headers to avoid detection
const BROWSER_HEADERS = {
  'User-Agent': BROWSER_USER_AGENT,
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'DNT': '1',
  'Connection': 'keep-alive',
  'Upgrade-Insecure-Requests': '1',
  'Sec-Fetch-Dest': 'document',
  'Sec-Fetch-Mode': 'navigate',
  'Sec-Fetch-Site': 'none',
  'Sec-Fetch-User': '?1',
  'Pragma': 'no-cache',
  'Cache-Control': 'no-cache',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
  console.log(`[DEBUG] Received request: ${req.method} ${req.url}`);
  
  // Apply CORS middleware
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Handle OPTIONS request immediately after CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Ensure it's a GET request after OPTIONS is handled
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    // Simple path extraction - first try using the query param method which worked before
    let pathSegments: string[] = [];
    let endpoint = '';
    
    if (req.query.path) {
      // This is the method that worked before
      const path = req.query.path;
      pathSegments = Array.isArray(path) ? path : [path];
      endpoint = pathSegments.join('/');
      console.log(`[DEBUG] Using req.query.path: ${endpoint}`);
    } else {
      // Fallback to URL parsing as a backup method
      const url = req.url || '';
      console.log(`[DEBUG] Raw URL: ${url}`);
      
      const basePath = '/api/proxy/';
      const basePathIndex = url.indexOf(basePath);
      
      if (basePathIndex !== -1) {
        endpoint = url.substring(basePathIndex + basePath.length).split('?')[0];
        pathSegments = endpoint.split('/');
        console.log(`[DEBUG] Extracted from URL: ${endpoint}`);
      }
    }
    
    if (!endpoint) {
      console.warn('[ERROR] Could not determine endpoint from request');
      return res.status(400).json({ error: 'Bad Request: Could not determine endpoint' });
    }

    console.log(`[INFO] Processing endpoint: ${endpoint}`);

    // Now route based on the extracted endpoint
    if (endpoint.startsWith('yahoo-finance/')) {
      const symbol = pathSegments[1] || '';
      if (!symbol) {
        console.error('[Yahoo Finance] Missing symbol');
        return res.status(400).json({ error: 'Missing stock symbol' });
      }
      
      
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&includePrePost=false`;
      
      try {
        const response = await axios.get(yahooUrl, {
          headers: BROWSER_HEADERS,
          timeout: 10000, 
        });
        
        return res.status(200).json(response.data);
      } catch (yahooError) {
        console.error(`[Yahoo Finance] Error fetching data for symbol ${symbol}:`, yahooError);
        
        // Try alternative service if Yahoo fails
        try {
          const fallbackUrl = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=demo`;
          const fallbackResponse = await axios.get(fallbackUrl);
          return res.status(200).json(fallbackResponse.data);
        } catch (fallbackError) {
          console.error('[Fallback] Alternative service also failed:', fallbackError);
          throw yahooError; 
        }
      }
      
    } else if (endpoint.startsWith('yahoo-finance-history/')) {
      const symbol = pathSegments[1] || '';
      if (!symbol) {
        console.error('[Yahoo History] Missing symbol');
        return res.status(400).json({ error: 'Missing stock symbol' });
      }
      
      const interval = req.query.interval || '1d';
      const range = req.query.range || '1y';
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}&includePrePost=false`;
      
      const response = await axios.get(yahooUrl, {
        headers: BROWSER_HEADERS,
        timeout: 30000, // 30 second timeout
      });
      
      return res.status(200).json(response.data);
      
    } else if (endpoint === 'stoic-quote') {
      console.log('[Stoic Quote] Attempting to fetch quote');
      
      try {
        const response = await axios.get('https://stoic-quotes.com/api/quote', {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        });
        
        console.log('[Stoic Quote] Request successful');
        return res.status(200).json(response.data);
      } catch (error) {
        // Fallback to tekloon if the first one fails
        console.log('[Stoic Quote] Primary source failed, trying backup');
        const response = await axios.get('https://stoic.tekloon.net/stoic-quote', {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        });
        
        console.log('[Stoic Quote] Backup request successful');
        return res.status(200).json(response.data);
      }
      
    } 
    else if (endpoint === 'debug-query') {
      console.log('[Debug] Query object:', req.query);
      return res.status(200).json({
        query: req.query,
        url: req.url,
        method: req.method,
        headers: req.headers
      });
    }
    else if (endpoint === 'debug') {
      console.log('[Debug] Debug endpoint called');
      return res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        version: 'latest deployment'
      });
    }else if (endpoint === 'ping') {
      console.log('[Ping] Request received');
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Proxy is functioning properly'
      });
      
    } else {
      console.warn(`[Not Found] Endpoint not recognized: ${endpoint}`);
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error(`[Proxy Error] Error processing request:`, error);
    
    if (axios.isAxiosError(error)) {
      console.error('[Proxy Error] Axios error details:', {
        message: error.message,
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
      });
      
      const statusCode = error.response?.status || 500;
      return res.status(statusCode).json({
        error: 'Proxy error during downstream request',
        message: error.message,
        status: error.response?.status,
      });
    } else {
      console.error('[Proxy Error] Non-Axios error:', error);
      return res.status(500).json({
        error: 'Internal server error in proxy',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}