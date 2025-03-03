// Simple proxy server proxyServer.js
const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all routes
app.use(cors());

// Proxy endpoint for Stoic Quote API
app.get('/api/stoic-quote', async (req, res) => {
  try {
   // console.log('Fetching stoic quote...');
    const response = await axios.get('https://stoic.tekloon.net/stoic-quote');
  //  console.log('Stoic quote fetched successfully');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stoic quote:', error);
    res.status(500).json({ error: 'Failed to fetch stoic quote' });
  }
});

// Proxy endpoint for Yahoo Finance API (current data)
app.get('/api/yahoo-finance/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    //console.log(`Fetching Yahoo Finance current data for ${symbol}...`);
    
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    //console.log(`Yahoo Finance current data for ${symbol} fetched successfully`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${req.params.symbol}:`, error);
    res.status(500).json({ error: `Failed to fetch Yahoo Finance data for ${req.params.symbol}` });
  }
});

// Proxy endpoint for Yahoo Finance Historical API
app.get('/api/yahoo-finance-history/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
    let period1 = req.query.period1;
    let period2 = req.query.period2;
    const interval = req.query.interval || '1mo';
    
    // Validate and sanitize input parameters
    if (!symbol || symbol.length > 20) {
      return res.status(400).json({ error: 'Invalid symbol parameter' });
    }
    
    // Ensure period1 and period2 are valid timestamps
    if (!period1 || isNaN(Number(period1))) {
      // Default to 1 year ago if not provided or invalid
      period1 = Math.floor(Date.now() / 1000) - 31536000; // 1 year in seconds
    }
    
    if (!period2 || isNaN(Number(period2))) {
      // Default to now if not provided or invalid
      period2 = Math.floor(Date.now() / 1000);
    }
    
    // Ensure period2 is not in the future (Yahoo Finance will return 404)
    const now = Math.floor(Date.now() / 1000);
    if (Number(period2) > now) {
      //console.log(`Warning: period2 (${period2}) is in the future. Clamping to current time (${now}).`);
      period2 = now;
    }
    
    //console.log(`Fetching Yahoo Finance historical data for ${symbol}...`);
    //console.log(`Parameters: period1=${period1}, period2=${period2}, interval=${interval}`);
    
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=${interval}`;
    //console.log(`Request URL: ${url}`);
    
    try {
      const response = await axios.get(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0'
        },
        timeout: 10000 // 10 second timeout
      });
      
      // Validate response data
      if (!response.data || !response.data.chart || !response.data.chart.result || response.data.chart.result.length === 0) {
        console.error(`Invalid response format from Yahoo Finance for ${symbol}`);
        return res.status(500).json({ 
          error: `Invalid response format from Yahoo Finance for ${symbol}`,
          details: 'The response did not contain the expected data structure'
        });
      }
      
      //console.log(`Yahoo Finance historical data for ${symbol} fetched successfully`);
      res.json(response.data);
    } catch (axiosError) {
      // Handle specific axios errors
      if (axiosError.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Yahoo Finance API error for ${symbol}: ${axiosError.response.status} ${axiosError.response.statusText}`);
        console.error(`Response data:`, axiosError.response.data);
        
        return res.status(axiosError.response.status).json({
          error: `Yahoo Finance API error: ${axiosError.response.status} ${axiosError.response.statusText}`,
          details: axiosError.response.data
        });
      } else if (axiosError.request) {
        // The request was made but no response was received
        console.error(`No response received from Yahoo Finance API for ${symbol}`);
        return res.status(504).json({
          error: 'No response received from Yahoo Finance API',
          details: 'The request timed out or the server did not respond'
        });
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error(`Error setting up request to Yahoo Finance API for ${symbol}:`, axiosError.message);
        throw axiosError; // Let the outer catch handle this
      }
    }
  } catch (error) {
    console.error(`Error fetching Yahoo Finance historical data for ${req.params.symbol}:`, error);
    res.status(500).json({ 
      error: `Failed to fetch Yahoo Finance historical data for ${req.params.symbol}`,
      message: error.message
    });
  }
});

// Ping endpoint for network speed testing
app.get('/api/ping', (req, res) => {
  // Simply return the current timestamp
  res.json({ timestamp: Date.now() });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
  //console.log(`Available endpoints:`);
 // console.log(`- GET /api/stoic-quote`);
 // console.log(`- GET /api/yahoo-finance/:symbol`);
 // console.log(`- GET /api/yahoo-finance-history/:symbol`);
 // console.log(`- GET /api/ping`);
});
