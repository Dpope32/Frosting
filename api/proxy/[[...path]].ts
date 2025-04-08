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
      const parts = endpoint.split('/'); // e.g., ['yahoo-finance', 'aapl']
      if (parts.length < 2 || !parts[1]) {
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance' });
      }
      // Use the *original* path segment for the symbol (case-sensitive)
      const originalParts = originalRelativePath.split('/');
      const symbol = originalParts[1];
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
      const response = await axios.get(yahooUrl);
      return res.status(200).json(response.data);

    } else if (endpoint.startsWith('yahoo-finance-history/')) {
      const parts = endpoint.split('/'); // e.g., ['yahoo-finance-history', 'aapl']
       if (parts.length < 2 || !parts[1]) {
         return res.status(400).json({ error: 'Missing stock symbol for Yahoo Finance History' });
      }
      // Use the *original* path segment for the symbol (case-sensitive)
      const originalParts = originalRelativePath.split('/');
      const symbol = originalParts[1];
      // Get query params from the original req.query object
      const interval = req.query.interval || '1d';
      const range = req.query.range || '1y';
      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
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
    const endpointAttempt = req.url || 'unknown URL'; // Log the URL on error
    console.error(`Proxy error processing endpoint: ${endpointAttempt}`, error);
    // Avoid leaking detailed errors in production if possible
    const message = error instanceof Error ? error.message : 'Unknown error';
    // Check if it's an Axios error to potentially get status code
    let statusCode = 500;
    if (axios.isAxiosError(error) && error.response) {
        statusCode = error.response.status; // Forward status from downstream if available
    }
    return res.status(statusCode).json({
      error: 'Proxy error',
      // details: message // Maybe omit details in prod?
    });
  }
}
