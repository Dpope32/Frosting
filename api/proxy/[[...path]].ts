import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: true, // Consider making this more specific for production if possible
  methods: ['GET', 'OPTIONS'],
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    // --- START: Parse req.url instead of req.query.path ---
    const url = req.url;
    if (!url) {
        // Add a basic check for the URL itself
        console.warn('Proxy request with missing req.url');
        return res.status(400).json({ error: 'Bad Request: Missing URL' });
    }

    // Define the base path of this proxy function
    const basePath = '/api/proxy/';
    let relativePath = '';
    const basePathIndex = url.indexOf(basePath);

    if (basePathIndex !== -1) {
        // Extract the part *after* /api/proxy/
        // Also, remove any query string parameters (like ?interval=...)
        relativePath = url.substring(basePathIndex + basePath.length).split('?')[0];
    }

    // Handle cases where the extracted path is empty
    if (!relativePath) {
        console.warn('Proxy request with empty relative path derived from URL:', req.url);
        return res.status(404).json({ error: 'Endpoint not specified' });
    }
    // --- END: Parse req.url ---

    // Keep the original relative path for case-sensitive parts like stock symbols
    const originalRelativePath = relativePath;

    // Normalize the endpoint for matching (lowercase, remove trailing slash)
    let endpoint = relativePath.toLowerCase();
    if (endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1);
    }

    // Optional: Log the derived endpoint for debugging (remove later)
    // console.log(`Processing normalized endpoint from URL: ${endpoint}`);

    // Route requests based on normalized path
    if (endpoint.startsWith('yahoo-finance/')) {
      const parts = endpoint.split('/');
      if (parts.length < 2 || !parts[1]) {
         console.error('[Yahoo Finance] Missing symbol in endpoint:', endpoint); // Log error
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance' });
      }
      const originalParts = originalRelativePath.split('/');
      const symbol = originalParts[1]; // Use original case symbol

      // --- Add Logging ---
      console.log(`[Yahoo Finance] Attempting symbol: ${symbol}`);
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
      console.log(`[Yahoo Finance] Requesting URL: ${yahooUrl}`);
      // --- End Logging ---

      const response = await axios.get(yahooUrl);
      console.log(`[Yahoo Finance] Success for symbol: ${symbol}`); // Log success
      return res.status(200).json(response.data);

    } else if (endpoint.startsWith('yahoo-finance-history/')) {
      const parts = endpoint.split('/');
       if (parts.length < 2 || !parts[1]) {
         console.error('[Yahoo History] Missing symbol in endpoint:', endpoint); // Log error
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance History' });
      }
      const originalParts = originalRelativePath.split('/');
      const symbol = originalParts[1]; // Use original case symbol
      const interval = req.query.interval || '1d';
      const range = req.query.range || '1y';

      // --- Add Logging ---
      console.log(`[Yahoo History] Attempting symbol: ${symbol}, interval: ${interval}, range: ${range}`);
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
      console.log(`[Yahoo History] Requesting URL: ${yahooUrl}`);
      // --- End Logging ---

      const response = await axios.get(yahooUrl);
      console.log(`[Yahoo History] Success for symbol: ${symbol}`); // Log success
      return res.status(200).json(response.data);

    } else if (endpoint === 'stoic-quote') {
      const stoicUrl = 'https://stoic.tekloon.net/stoic-quote';
      const response = await axios.get(stoicUrl);
      console.log('[Stoic Quote] Request successful'); // Log success
      return res.status(200).json(response.data);

    } else if (endpoint === 'ping') {
      console.log('[Ping] Request successful'); // Log success
      return res.status(200).json({ status: 'ok' });

    } else {
      console.warn(`[Not Found] Endpoint not matched: ${endpoint}`, req.url); // Log 404
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    const endpointAttempt = req.url || 'unknown URL';
    // --- Improved Error Logging ---
    console.error(`[Proxy Catch Error] Failed processing URL: ${endpointAttempt}`);
    if (axios.isAxiosError(error)) {
        console.error('[Proxy Catch Error] Axios error:', {
            message: error.message,
            url: error.config?.url,
            status: error.response?.status,
            statusText: error.response?.statusText,
            data: error.response?.data, // Log response data from Yahoo if available
        });
        // Forward status from downstream if available, otherwise 500
        const statusCode = error.response?.status || 500;
        // Return more detailed error temporarily for debugging
        return res.status(statusCode).json({
            error: 'Proxy error during downstream request',
            details: error.message,
            downstreamStatus: error.response?.status,
            downstreamData: error.response?.data, // Send downstream error back
        });
    } else {
        console.error('[Proxy Catch Error] Non-Axios error:', error);
        // Return more detailed error temporarily for debugging
        return res.status(500).json({
          error: 'Internal server error in proxy',
          details: error instanceof Error ? error.message : 'Unknown error',
        });
    }
    // --- End Improved Error Logging ---
  }
}
