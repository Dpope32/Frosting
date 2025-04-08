import type { VercelRequest, VercelResponse } from '@vercel/node';
import axios from 'axios';
import cors from 'cors';

// Initialize CORS middleware
const corsMiddleware = cors({
  origin: true,
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
    const { path } = req.query;

    // Handle cases where path might be missing or invalid
    if (!path || (Array.isArray(path) && path.length === 0)) {
      console.warn('Proxy request with empty path:', req.url); // Optional: Log warning if possible
      return res.status(404).json({ error: 'Endpoint not specified' });
    }

    const pathArray = Array.isArray(path) ? path : [path];
    let endpoint = pathArray.join('/');

    // Normalize the endpoint for more robust matching:
    endpoint = endpoint.toLowerCase(); // Make case-insensitive
    if (endpoint.endsWith('/')) {
      endpoint = endpoint.slice(0, -1); // Remove trailing slash
    }

    console.log(`Processing normalized endpoint: ${endpoint}`); // Temporarily log for debugging if possible

    // Route requests based on normalized path
    if (endpoint.startsWith('yahoo-finance/')) {
      // Extract symbol carefully after normalization
      const parts = endpoint.split('/'); // e.g., ['yahoo-finance', 'aapl']
      if (parts.length < 2 || !parts[1]) {
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance' });
      }
      const symbol = parts[1]; // Use the part after 'yahoo-finance/'
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`; // Consider using the original case symbol if API requires it
      const response = await axios.get(yahooUrl);
      return res.status(200).json(response.data);

    } else if (endpoint.startsWith('yahoo-finance-history/')) {
       // Extract symbol carefully after normalization
      const parts = endpoint.split('/'); // e.g., ['yahoo-finance-history', 'aapl']
       if (parts.length < 2 || !parts[1]) {
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance History' });
      }
      const symbol = parts[1]; // Use the part after 'yahoo-finance-history/'
      const interval = req.query.interval || '1d'; // Keep original query params
      const range = req.query.range || '1y';
      // Use original case symbol if API requires it, construct URL carefully
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${pathArray[1]}?interval=${interval}&range=${range}`; // Use original pathArray[1] for case?
      const response = await axios.get(yahooUrl);
      return res.status(200).json(response.data);

    } else if (endpoint === 'stoic-quote') {
      const stoicUrl = 'https://stoic.tekloon.net/stoic-quote';
      const response = await axios.get(stoicUrl);
      return res.status(200).json(response.data);

    } else if (endpoint === 'ping') {
      return res.status(200).json({ status: 'ok' });

    } else {
      console.warn(`Endpoint not found for normalized path: ${endpoint}`, req.url); // Optional log
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    // Log the specific endpoint that caused the error if possible
    const endpointAttempt = req.query.path ? (Array.isArray(req.query.path) ? req.query.path.join('/') : req.query.path) : 'unknown';
    console.error(`Proxy error processing endpoint: ${endpointAttempt}`, error);
    return res.status(500).json({
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
