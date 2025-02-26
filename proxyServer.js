// Simple proxy server to handle CORS issues
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

// Proxy endpoint for Yahoo Finance API
app.get('/api/yahoo-finance/:symbol', async (req, res) => {
  try {
    const symbol = req.params.symbol;
  //  console.log(`Fetching Yahoo Finance data for ${symbol}...`);
    
    const response = await axios.get(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0'
      }
    });
    
    console.log(`Yahoo Finance data for ${symbol} fetched successfully`);
    res.json(response.data);
  } catch (error) {
    console.error(`Error fetching Yahoo Finance data for ${req.params.symbol}:`, error);
    res.status(500).json({ error: `Failed to fetch Yahoo Finance data for ${req.params.symbol}` });
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
  console.log(`Available endpoints:`);
 // console.log(`- GET /api/stoic-quote`);
 // console.log(`- GET /api/yahoo-finance/:symbol`);
 // console.log(`- GET /api/ping`);
});
