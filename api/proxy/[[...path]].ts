import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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

// PocketBase configuration
const POCKETBASE_URLS = [
  'https://fedora.tail557534.ts.net',
  'http://192.168.1.32:8090'
];

export default async function handler(req: VercelRequest, res: VercelResponse) {
  await new Promise((resolve, reject) => {
    corsMiddleware(req, res, (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (!['GET', 'POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method || '')) {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    let pathSegments: string[] = [];
    let endpoint = '';
    let isPicketbaseRequest = false;
    
    if (req.query.path) {
      const path = req.query.path;
      pathSegments = Array.isArray(path) ? path : [path];
      endpoint = pathSegments.join('/');
    } else {
      const url = req.url || '';
      
      // Check if this is a PocketBase request
      if (url.includes('/api/pb/')) {
        isPicketbaseRequest = true;
        const basePath = '/api/pb/';
        const basePathIndex = url.indexOf(basePath);
        
        if (basePathIndex !== -1) {
          endpoint = url.substring(basePathIndex + basePath.length).split('?')[0];
          pathSegments = endpoint.split('/');
        }
      } else {
        const basePath = '/api/proxy/';
        const basePathIndex = url.indexOf(basePath);
        
        if (basePathIndex !== -1) {
          endpoint = url.substring(basePathIndex + basePath.length).split('?')[0];
          pathSegments = endpoint.split('/');
        }
      }
    }
    
    if (!endpoint) {
      console.warn('[ERROR] Could not determine endpoint from request');
      return res.status(400).json({ error: 'Bad Request: Could not determine endpoint' });
    }

    // Handle PocketBase requests
    if (isPicketbaseRequest) {
      return handlePocketBaseRequest(req, res, endpoint);
    }

    // Handle other proxy requests (existing logic)
    if (endpoint.startsWith('yahoo-finance/')) {
      const symbol = pathSegments[1] || '';
      if (!symbol) {
        console.error('[Yahoo Finance] Missing symbol');
        return res.status(400).json({ error: 'Missing stock symbol' });
      }

      // Try to scrape the data from yahoo finance
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&includePrePost=false`;
      try {
        const response = await axios.get(yahooUrl, {
          headers: BROWSER_HEADERS,
          timeout: 10000, 
        });
        
        return res.status(200).json(response.data);
      } catch (yahooError) {
        console.error(`[Yahoo Finance] Error fetching data for symbol ${symbol}:`, yahooError);
        
        // Try alternative service if Yahoo fails with API key
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
      
      try {
        const response = await axios.get('https://stoic-quotes.com/api/quote', {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        });
        
        return res.status(200).json(response.data);
      } catch (error) {
        // Fallback to tekloon if the first one fails
        const response = await axios.get('https://stoic.tekloon.net/stoic-quote', {
          headers: { 'User-Agent': BROWSER_USER_AGENT },
        });
        
        return res.status(200).json(response.data);
      }
      
    } 
    else if (endpoint === 'debug-query') {
      return res.status(200).json({
        query: req.query,
        url: req.url,
        method: req.method,
        headers: req.headers
      });
    }
    else if (endpoint === 'debug') {
      return res.status(200).json({
        status: 'ok',
        time: new Date().toISOString(),
        version: 'latest deployment'
      });
    }else if (endpoint === 'ping') {
      return res.status(200).json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        message: 'Proxy is functioning properly'
      });
      
    } else {
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

async function handlePocketBaseRequest(req: VercelRequest, res: VercelResponse, endpoint: string) {
  // Try each PocketBase URL until one works
  for (const baseUrl of POCKETBASE_URLS) {
    try {
      const targetUrl = `${baseUrl}/${endpoint}`;
      
      // Preserve query parameters
      const queryString = req.url?.split('?')[1];
      const fullUrl = queryString ? `${targetUrl}?${queryString}` : targetUrl;
      
      console.log(`[PocketBase] Trying: ${req.method} ${fullUrl}`);
      
      // Forward headers, but filter out problematic ones
      const forwardHeaders: Record<string, string> = {};
      
      // Copy important headers
      if (req.headers['content-type']) {
        forwardHeaders['content-type'] = req.headers['content-type'] as string;
      }
      if (req.headers['authorization']) {
        forwardHeaders['authorization'] = req.headers['authorization'] as string;
      }
      if (req.headers['accept']) {
        forwardHeaders['accept'] = req.headers['accept'] as string;
      }
      
      // Add User-Agent
      forwardHeaders['user-agent'] = BROWSER_USER_AGENT;
      
      const response = await axios({
        method: req.method as any,
        url: fullUrl,
        headers: forwardHeaders,
        data: req.body || undefined,
        timeout: 30000,
        validateStatus: () => true, // Don't throw on 4xx/5xx status codes
      });
      
      console.log(`[PocketBase] Response: ${response.status} from ${baseUrl}`);
      
      // Forward response headers
      Object.entries(response.headers).forEach(([key, value]) => {
        if (typeof value === 'string' && !['content-encoding', 'transfer-encoding'].includes(key.toLowerCase())) {
          res.setHeader(key, value);
        }
      });
      
      return res.status(response.status).json(response.data);
      
    } catch (error) {
      console.error(`[PocketBase] Failed to connect to ${baseUrl}:`, error instanceof Error ? error.message : String(error));
      
      // If this was the last URL, throw the error
      if (baseUrl === POCKETBASE_URLS[POCKETBASE_URLS.length - 1]) {
        throw error;
      }
      
      // Otherwise, try the next URL
      continue;
    }
  }
  
  // If we get here, all URLs failed
  throw new Error('All PocketBase URLs failed');
}