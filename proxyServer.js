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
    const response = await axios.get('https://stoic.tekloon.net/stoic-quote');
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching stoic quote:', error);
    res.status(500).json({ error: 'Failed to fetch stoic quote' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Proxy server running on port ${PORT}`);
});
