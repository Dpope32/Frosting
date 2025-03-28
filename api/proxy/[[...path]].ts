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
    corsMiddleware(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result);
      }
      return resolve(result);
    });
  });

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { path } = req.query;
    const pathArray = Array.isArray(path) ? path : [path];
    const endpoint = pathArray.join('/');

    // Route requests based on path
    if (endpoint.startsWith('yahoo-finance')) {
      const symbol = pathArray[1];
      const interval = req.query.interval || '1d';
      const range = req.query.range || '1y';

      const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${range}`;
      const response = await axios.get(yahooUrl);
      return res.status(200).json(response.data);
    }
    else if (endpoint === 'stoic-quote') {
      const stoicUrl = 'https://stoic.tekloon.net/stoic-quote';
      const response = await axios.get(stoicUrl);
      return res.status(200).json(response.data);
    }
    else if (endpoint === 'ping') {
      return res.status(200).json({ status: 'ok' });
    }
    else {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
