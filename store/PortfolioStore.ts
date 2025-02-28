// src/stores/PortfolioStore.ts
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { portfolioData } from '../utils/Portfolio';
import { StorageUtils } from '../store/AsyncStorage';
import ProxyServerManager from '../utils/ProxyServerManager';

interface PortfolioState {
    totalValue: number | null;
    prices: Record<string, number>;
    lastUpdate?: Date;
    principal: number;
    watchlist: string[];
    historicalData: Record<string, {
      '1m': number | null;
      '6m': number | null;
      '1y': number | null;
    }>;
}

// Initialize with default values
export const usePortfolioStore = create<PortfolioState>(() => {
  // Initialize with empty data
  const initialState: PortfolioState = {
    totalValue: null,
    prices: {},
    principal: 1000,
    watchlist: [],
    historicalData: {}
  };
  
  // Load data asynchronously
  Promise.all([
    StorageUtils.get<number>('portfolio_total'),
    StorageUtils.get<Record<string, number>>('portfolio_prices'),
    StorageUtils.get<number>('portfolio_principal'),
    StorageUtils.get<string[]>('portfolio_watchlist', [])
  ]).then(([total, prices, principal, watchlist]) => {
    usePortfolioStore.setState({
      totalValue: total ?? null,
      prices: prices ?? {},
      principal: principal ?? 1000,
      watchlist: watchlist ?? []
    });
  }).catch(error => {
    console.error('Error loading portfolio data:', error);
  });
  
  return initialState;
});

export const updatePrincipal = async (value: number) => {
  await StorageUtils.set('portfolio_principal', value);
  usePortfolioStore.setState({ principal: value });
};

export const addToWatchlist = async (symbol: string) => {
  const currentWatchlist = usePortfolioStore.getState().watchlist;
  if (!currentWatchlist.includes(symbol)) {
    const updatedWatchlist = [...currentWatchlist, symbol];
    await StorageUtils.set('portfolio_watchlist', updatedWatchlist);
    usePortfolioStore.setState({ watchlist: updatedWatchlist });
  }
};

export const removeFromWatchlist = async (symbol: string) => {
  const currentWatchlist = usePortfolioStore.getState().watchlist;
  const updatedWatchlist = currentWatchlist.filter(s => s !== symbol);
  await StorageUtils.set('portfolio_watchlist', updatedWatchlist);
  usePortfolioStore.setState({ watchlist: updatedWatchlist });
};

export const usePortfolioQuery = () => {
  return useQuery({
    queryKey: ['stock-prices'],
    queryFn: async () => {
      const cachedPrices = await StorageUtils.get<Record<string, number>>('portfolio_prices');
      const cachedTotal = await StorageUtils.get<number>('portfolio_total');
      const cachedHistoricalData = await StorageUtils.get<Record<string, any>>('portfolio_historical_data', {});
      
      try {
        // Get all symbols (portfolio + watchlist)
        const portfolioSymbols = portfolioData.map(stock => stock.symbol);
        const watchlistSymbols = usePortfolioStore.getState().watchlist;
        const allSymbols = [...new Set([...portfolioSymbols, ...watchlistSymbols])];
        
        const requests = allSymbols.map(async symbol => {
          try {
            // Get the appropriate URL based on platform and proxy server status
            const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`;
            const url = Platform.OS === 'web'
              ? await ProxyServerManager.getApiUrl(`yahoo-finance/${symbol}`, directUrl)
              : directUrl;
            
            // console.log(`[PortfolioStore] Fetching ${symbol} from ${url}`);
            
            const response = await fetch(url, {
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0'
              },
            });

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const result = data?.chart?.result?.[0];
            
            if (!result) {
              throw new Error('No result data found');
            }
            
            const price = result.meta?.regularMarketPrice;
            // Ensure we're getting the change data correctly
            const regularMarketChange = result.meta?.regularMarketChange ?? 0;
            const regularMarketChangePercent = result.meta?.regularMarketChangePercent ?? 0;
            
            if (!price) {
              throw new Error('No price data found');
            }
            
            if (__DEV__) {
              console.log(`[PortfolioStore] Fetched data for ${symbol}:`, {
                price,
                change: regularMarketChange,
                changePercent: regularMarketChangePercent
              });
            }

            return { 
              symbol, 
              price, 
              change: regularMarketChange,
              changePercent: regularMarketChangePercent,
              error: null 
            };
          } catch (error) {
            const cached = cachedPrices ?? {};
            if (__DEV__) console.error(`[PortfolioStore] Error fetching ${symbol}:`, error);
            return { 
              symbol, 
              price: cached[symbol] || 0,
              change: 0,
              changePercent: 0,
              error 
            };
          }
        });
        
        const results = await Promise.allSettled(requests);
        const priceData: Record<string, number> = {};
        const changeData: Record<string, number> = {};
        const changePercentData: Record<string, number> = {};
        let total = 0;
        let hasErrors = false;

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { symbol, price, change, changePercent, error } = result.value;
            const stock = portfolioData.find(s => s.symbol === symbol);
  
            if (error) {
              hasErrors = true;
              if (__DEV__) console.warn(`[PortfolioStore] Error fetching ${symbol}:`, error);
            }
  
            priceData[symbol] = price;
            changeData[symbol] = change;
            changePercentData[symbol] = changePercent;
            
            // Only add to total if it's in the portfolio
            if (stock) {
              total += price * stock.quantity;
            }
          } else {
            hasErrors = true;
            if (__DEV__) console.warn(`[PortfolioStore] Error fetching:`, result.reason);
          }
        });

        if (__DEV__) {
          console.log('[PortfolioStore] Prices:', priceData);
          console.log('[PortfolioStore] Change Percents:', changePercentData);
        }
        
        console.log('[PortfolioStore] Fetching historical data for symbols:', Object.keys(priceData));
        // Fetch historical data for returns calculation
        const historicalData = await fetchHistoricalData(Object.keys(priceData), cachedHistoricalData);
        console.log('[PortfolioStore] Historical data result:', JSON.stringify(historicalData, null, 2));
        
        // Only store new data if we got at least some valid prices
        if (!hasErrors || Object.values(priceData).some(price => price > 0)) {
          await StorageUtils.set('portfolio_prices', priceData);
          await StorageUtils.set('portfolio_total', total);
          await StorageUtils.set('portfolio_historical_data', historicalData);
          await StorageUtils.set('portfolio_last_update', new Date().toISOString());

          usePortfolioStore.setState({
            prices: priceData,
            totalValue: total,
            historicalData,
            lastUpdate: new Date()
          });
        }

        return {
          prices: priceData,
          changes: changeData,
          changePercents: changePercentData,
          historicalData
        };

      } catch (error) {
        console.error('[PortfolioStore] Critical error:', error);
        
        // Return cached data if available
        if (cachedPrices) {
          const prices = cachedPrices;
          usePortfolioStore.setState({
            prices,
            totalValue: cachedTotal ?? 0,
            historicalData: cachedHistoricalData ?? {}
          });
          return {
            prices,
            changes: {},
            changePercents: {},
            historicalData: cachedHistoricalData ?? {}
          };
        }
        
        // Last resort: initialize with zeros
        const allSymbols = [...portfolioData.map(stock => stock.symbol), ...usePortfolioStore.getState().watchlist];
        return {
          prices: Object.fromEntries(allSymbols.map(symbol => [symbol, 0])),
          changes: {},
          changePercents: {},
          historicalData: {}
        };
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000), 
    refetchInterval: 1000 * 60 * 60, // 60 minutes
    refetchOnReconnect: true,
    refetchOnWindowFocus: true
  });
};

// Helper function to fetch historical data
const fetchHistoricalData = async (
  symbols: string[], 
  cachedData: Record<string, any> = {}
): Promise<Record<string, { '1m': number | null; '6m': number | null; '1y': number | null }>> => {
  // Only log in development
  if (__DEV__) console.log('[fetchHistoricalData] Starting with symbols:', symbols);
  
  const result: Record<string, { '1m': number | null; '6m': number | null; '1y': number | null }> = {};
  
  // If we have cached data less than 24 hours old, use it
  const lastUpdate = await StorageUtils.get<string>('portfolio_historical_last_update');
  
  // Check if cached data has actual values or just nulls
  const hasRealData = Object.values(cachedData).some(data => 
    data['1m'] !== null || data['6m'] !== null || data['1y'] !== null
  );
  
  if (lastUpdate && hasRealData) {
    const lastUpdateDate = new Date(lastUpdate);
    const now = new Date();
    const hoursSinceUpdate = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);
    
    if (hoursSinceUpdate < 24 && Object.keys(cachedData).length > 0) {
      if (__DEV__) console.log('[fetchHistoricalData] Using cached data');
      return cachedData;
    }
  } else {
    if (__DEV__) console.log('[fetchHistoricalData] Cached data has no real values or no last update, fetching fresh data');
    // Clear the cached data to force a fresh fetch
    await StorageUtils.set('portfolio_historical_data', {});
  }
  
  try {
    // Calculate dates for different periods
    const deviceNow = new Date();
    
    // Clamp "now" to ensure it never exceeds the current real-world time
    // This fixes the issue when the device clock is set to a future date (e.g., 2025)
    const realNowMs = Date.now(); // Current real-world timestamp in milliseconds
    const safeNowMs = Math.min(deviceNow.getTime(), realNowMs);
    const safeNow = new Date(safeNowMs);
    
    // Use the safe "now" date for all calculations
    const oneMonthAgo = new Date(safeNowMs);
    oneMonthAgo.setMonth(safeNow.getMonth() - 1);
    const sixMonthsAgo = new Date(safeNowMs);
    sixMonthsAgo.setMonth(safeNow.getMonth() - 6);
    const oneYearAgo = new Date(safeNowMs);
    oneYearAgo.setFullYear(safeNow.getFullYear() - 1);
    
    if (__DEV__) {
      console.log('[fetchHistoricalData] Date ranges:', {
        deviceNow: deviceNow.toISOString(),
        safeNow: safeNow.toISOString(),
        oneMonthAgo: oneMonthAgo.toISOString(),
        sixMonthsAgo: sixMonthsAgo.toISOString(),
        oneYearAgo: oneYearAgo.toISOString()
      });
    }
    
    // Format dates for Yahoo Finance API
    const formatDate = (date: Date) => Math.floor(date.getTime() / 1000);
    const period1 = formatDate(oneYearAgo); // Start from 1 year ago
    const period2 = Math.floor(safeNowMs / 1000); // Use the safe "now" timestamp
    
    if (__DEV__) console.log('[fetchHistoricalData] API periods:', { period1, period2 });
  
    // Process symbols in batches to avoid rate limiting
    for (let i = 0; i < symbols.length; i += 3) {
      const batch = symbols.slice(i, i + 3);
      
      await Promise.all(batch.map(async (symbol) => {
        try {
          // Get the appropriate URL based on platform and proxy server status
          const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?period1=${period1}&period2=${period2}&interval=1mo`;
          let url;
          
          if (Platform.OS === 'web') {
            // For web, we need to use the proxy server
            url = `http://localhost:3000/api/yahoo-finance-history/${symbol}?period1=${period1}&period2=${period2}&interval=1mo`;
            if (__DEV__) console.log(`[fetchHistoricalData] Using proxy URL for ${symbol}: ${url}`);
          } else {
            url = directUrl;
            if (__DEV__) console.log(`[fetchHistoricalData] Using direct URL for ${symbol}: ${url}`);
          }
          
          // Add detailed error logging
          if (__DEV__) console.log(`[fetchHistoricalData] Fetching data for ${symbol} with period1=${period1}, period2=${period2}`);
          
          const response = await fetch(url, {
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0'
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP error! status: ${response.status}, response: ${errorText}`);
          }
          
          const data = await response.json();
          
          // More detailed validation and error logging
          if (!data || !data.chart) {
            throw new Error(`Invalid response format: missing 'chart' property`);
          }
          
          if (!data.chart.result || !data.chart.result[0]) {
            throw new Error(`Invalid response format: missing 'chart.result' array or empty array`);
          }
          
          const timestamps = data.chart.result[0].timestamp;
          if (!timestamps || !Array.isArray(timestamps)) {
            throw new Error(`Invalid response format: missing or invalid 'timestamps' array`);
          }
          
          const indicators = data.chart.result[0].indicators;
          if (!indicators || !indicators.quote || !indicators.quote[0]) {
            throw new Error(`Invalid response format: missing 'indicators.quote' array`);
          }
          
          const closePrices = indicators.quote[0].close;
          if (!closePrices || !Array.isArray(closePrices)) {
            throw new Error(`Invalid response format: missing or invalid 'close' prices array`);
          }
          
          if (timestamps.length === 0 || closePrices.length === 0) {
            throw new Error('No historical data found (empty arrays)');
          }
        
          // Find the closest data points to our target dates
          const findClosestPrice = (targetDate: Date) => {
            const targetTimestamp = Math.floor(targetDate.getTime() / 1000);
            let closestIndex = 0;
            let minDiff = Number.MAX_SAFE_INTEGER;
            
            for (let j = 0; j < timestamps.length; j++) {
              const diff = Math.abs(timestamps[j] - targetTimestamp);
              if (diff < minDiff) {
                minDiff = diff;
                closestIndex = j;
              }
            }
            
            const price = closePrices[closestIndex] || null;
            return price;
          };
          
          const oneMonthPrice = findClosestPrice(oneMonthAgo);
          const sixMonthPrice = findClosestPrice(sixMonthsAgo);
          const oneYearPrice = findClosestPrice(oneYearAgo);
          
          result[symbol] = {
            '1m': oneMonthPrice,
            '6m': sixMonthPrice,
            '1y': oneYearPrice
          };
          
          if (__DEV__) console.log(`[fetchHistoricalData] Successfully fetched historical data for ${symbol}`);
        } catch (error) {
          // Enhanced error logging
          if (__DEV__) {
            console.error(`[fetchHistoricalData] Error fetching historical data for ${symbol}:`, error);
            if (error instanceof Error) {
              console.error(`[fetchHistoricalData] Error message: ${error.message}`);
              console.error(`[fetchHistoricalData] Error stack: ${error.stack}`);
            }
          }
          
          // Use cached data if available, otherwise null values
          result[symbol] = cachedData[symbol] || { '1m': null, '6m': null, '1y': null };
        }
      }));
      
      // Add a small delay between batches to avoid rate limiting
      if (i + 3 < symbols.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    await StorageUtils.set('portfolio_historical_last_update', new Date().toISOString());
    return result;
  } catch (error) {
    // Global error handler to prevent crashes in production
    console.error('[fetchHistoricalData] Critical error in historical data fetching:', error);
    
    // Return cached data or empty data to prevent crashes
    return cachedData || symbols.reduce((acc, symbol) => {
      acc[symbol] = { '1m': null, '6m': null, '1y': null };
      return acc;
    }, {} as Record<string, { '1m': number | null; '6m': number | null; '1y': number | null }>);
  }
};
