describe('CORS Proxy API', () => {
  const stoicApi = 'https://stoic.tekloon.net/stoic-quote';
  
  test('fetching directly from Stoic Quote API should have correct structure', async () => {
    // In Node/Jest, fetch will succeed; in a browser this could fail due to CORS.
    const response = await fetch(stoicApi);
    expect(response.ok).toBe(true);
    const data = await response.json();
    
    // The API can return either { data: { quote, author } } or { quote, author }
    // Handle both formats for flexibility
    if (data.data) {
      expect(data.data).toHaveProperty('quote');
      expect(data.data).toHaveProperty('author');
    } else {
      expect(data).toHaveProperty('quote');
      expect(data).toHaveProperty('author');
    }
  });
  
  test('API data can be accessed consistently regardless of structure', async () => {
    const response = await fetch(stoicApi);
    expect(response.ok).toBe(true);
    const rawData = await response.json();
    
    // Extract quote and author regardless of the structure
    const data = rawData.data || rawData;
    
    // Verify we can extract the data in a standardized way
    expect(data.quote).toBeDefined();
    expect(typeof data.quote).toBe('string');
    expect(data.author).toBeDefined();
    expect(typeof data.author).toBe('string');
  });
});