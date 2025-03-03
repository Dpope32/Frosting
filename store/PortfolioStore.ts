// Enhanced PortfolioStore.ts with earliest historical data fetching
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { portfolioData, updatePortfolioData } from '../utils/Portfolio';
import { StorageUtils } from '../store/AsyncStorage';
import ProxyServerManager from '../utils/ProxyServerManager';

interface PortfolioState {
    totalValue: number | null;
    prices: Record<string, number>;
    lastUpdate?: Date;
    principal: number;
    watchlist: string[];
    historicalData: Record<string, {
      '1w': number | null;
      '1m': number | null;
      '3m': number | null;
      '6m': number | null;
      '1y': number | null;
      'ytd': number | null;
      'earliest': number | null; // Added earliest price point
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


// Function to remove a stock from the portfolio
export const removeFromPortfolio = async (symbol: string) => {
  try {
    // Filter out the stock with the given symbol
    const updatedPortfolio = [...portfolioData].filter((stock) => stock.symbol !== symbol);
    
    // Update the portfolio data
    await updatePortfolioData(updatedPortfolio);
    
    // Recalculate total value
    const prices = usePortfolioStore.getState().prices;
    let newTotal = 0;
    updatedPortfolio.forEach((stock) => {
      const price = prices[stock.symbol] || 0;
      newTotal += price * stock.quantity;
    });
    
    // Update the store state
    usePortfolioStore.setState({ totalValue: newTotal });
    
    // Force a refresh of the portfolio data
    const { refetch } = usePortfolioQuery();
    if (refetch) {
      setTimeout(() => {
        refetch();
      }, 100);
    }
  } catch (error) {
    console.error('Error removing stock from portfolio:', error);
  }
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
            const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`;
            const url = Platform.OS === 'web'
              ? await ProxyServerManager.getApiUrl(`yahoo-finance/${symbol}`, directUrl)
              : directUrl;
            
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
            
            if (!result || !result.meta) {
              throw new Error('No result data found');
            }
            
            const meta = result.meta;
            const price = meta.regularMarketPrice;
            const previousClose = meta.chartPreviousClose || 0;
            
            // Calculate the change percentage manually
            const change = price - previousClose;
            const changePercent = previousClose ? (change / previousClose) * 100 : 0;
            
            // Get additional market data for buy indicator
            const fiftyTwoWeekHigh = meta.fiftyTwoWeekHigh || 0;
            const fiftyTwoWeekLow = meta.fiftyTwoWeekLow || 0;
            
            if (!price) {
              throw new Error('No price data found');
            }

            return { 
              symbol, 
              price, 
              previousClose,
              change,
              changePercent,
              fiftyTwoWeekHigh,
              fiftyTwoWeekLow,
              error: null 
            };
          } catch (error) {
            const cached = cachedPrices ?? {};
            if (__DEV__) console.error(`[PortfolioStore] Error fetching ${symbol}:`, error);
            return { 
              symbol, 
              price: cached[symbol] || 0,
              previousClose: 0,
              change: 0,
              changePercent: 0,
              fiftyTwoWeekHigh: 0,
              fiftyTwoWeekLow: 0,
              error 
            };
          }
        });
        
        const results = await Promise.allSettled(requests);
        const priceData: Record<string, number> = {};
        const previousCloseData: Record<string, number> = {};
        const changeData: Record<string, number> = {};
        const changePercentData: Record<string, number> = {};
        const fiftyTwoWeekHighData: Record<string, number> = {};
        const fiftyTwoWeekLowData: Record<string, number> = {};
        let total = 0;
        let hasErrors = false;

        results.forEach(result => {
          if (result.status === 'fulfilled') {
            const { 
              symbol, 
              price, 
              previousClose,
              change, 
              changePercent, 
              fiftyTwoWeekHigh,
              fiftyTwoWeekLow,
              error 
            } = result.value;
            
            const stock = portfolioData.find(s => s.symbol === symbol);
  
            if (error) {
              hasErrors = true;
              if (__DEV__) console.warn(`[PortfolioStore] Error fetching ${symbol}:`, error);
            }
  
            priceData[symbol] = price;
            previousCloseData[symbol] = previousClose;
            changeData[symbol] = change;
            changePercentData[symbol] = changePercent;
            fiftyTwoWeekHighData[symbol] = fiftyTwoWeekHigh;
            fiftyTwoWeekLowData[symbol] = fiftyTwoWeekLow;
            
            // Only add to total if it's in the portfolio
            if (stock) {
              total += price * stock.quantity;
            }
          } else {
            hasErrors = true;
            if (__DEV__) console.warn(`[PortfolioStore] Error fetching:`, result.reason);
          }
        });
        
        // Fetch historical data for returns calculation with max range for all-time data
        const historicalData = await fetchHistoricalDataWithEarliest(Object.keys(priceData), cachedHistoricalData);
        
        // Only store new data if we got at least some valid prices
        if (!hasErrors || Object.values(priceData).some(price => price > 0)) {
          await StorageUtils.set('portfolio_prices', priceData);
          await StorageUtils.set('portfolio_previous_close', previousCloseData);
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
          previousClose: previousCloseData,
          changes: changeData,
          changePercents: changePercentData,
          fiftyTwoWeekHigh: fiftyTwoWeekHighData,
          fiftyTwoWeekLow: fiftyTwoWeekLowData,
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
            previousClose: {},
            changes: {},
            changePercents: {},
            fiftyTwoWeekHigh: {},
            fiftyTwoWeekLow: {},
            historicalData: cachedHistoricalData ?? {}
          };
        }
        
        // Last resort: initialize with zeros
        const allSymbols = [...portfolioData.map(stock => stock.symbol), ...usePortfolioStore.getState().watchlist];
        return {
          prices: Object.fromEntries(allSymbols.map(symbol => [symbol, 0])),
          previousClose: {},
          changes: {},
          changePercents: {},
          fiftyTwoWeekHigh: {},
          fiftyTwoWeekLow: {},
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

// Updated fetchHistoricalData function to fetch earliest price data
const fetchHistoricalDataWithEarliest = async (
  symbols: string[], 
  cachedData: Record<string, any> = {}
): Promise<Record<string, { '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }>> => {
  
  const result: Record<string, { '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }> = {};

  await StorageUtils.set('portfolio_historical_data', {});
  await StorageUtils.set('portfolio_historical_last_update', '');
  
  try {
    // Calculate dates for different periods
    const deviceNow = new Date();
    
    // Clamp "now" to ensure it never exceeds the current real-world time
    const realNowMs = Date.now();
    const safeNowMs = Math.min(deviceNow.getTime(), realNowMs);
    const safeNow = new Date(safeNowMs);
    
    // Use the safe "now" date for all calculations
    const oneMonthAgo = new Date(safeNowMs);
    oneMonthAgo.setMonth(safeNow.getMonth() - 1);
    const sixMonthsAgo = new Date(safeNowMs);
    sixMonthsAgo.setMonth(safeNow.getMonth() - 6);
    const oneYearAgo = new Date(safeNowMs);
    oneYearAgo.setFullYear(safeNow.getFullYear() - 1);
    
    // Process symbols in batches to avoid rate limiting
    for (let i = 0; i < symbols.length; i += 3) {
      const batch = symbols.slice(i, i + 3);
      
      await Promise.all(batch.map(async (symbol) => {
        try {
          // Regular historical data for 1m, 6m, 1y
          const regularHistoricalData = await fetchRegularHistoricalData(symbol);
          
          // Extended history for "earliest" data point (max range)
          const earliestData = await fetchEarliestData(symbol);
          
          result[symbol] = {
            ...regularHistoricalData,
            'earliest': earliestData
          };

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
          result[symbol] = cachedData[symbol] || { 
            '1w': null, 
            '1m': null, 
            '3m': null, 
            '6m': null, 
            '1y': null, 
            'ytd': null, 
            'earliest': null 
          };
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
      acc[symbol] = { 
        '1w': null, 
        '1m': null, 
        '3m': null, 
        '6m': null, 
        '1y': null, 
        'ytd': null, 
        'earliest': null 
      };
      return acc;
    }, {} as Record<string, { '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }>);
  }
};

// Helper function to fetch regular historical data (1w, 1m, 3m, 6m, 1y, ytd)
const fetchRegularHistoricalData = async (symbol: string): Promise<{ '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null }> => {
  try {
    // Get the appropriate URL based on platform and proxy server status
    // Use 1d interval with range=1y to get more granular data
    const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1y`;
    let url;
    
    if (Platform.OS === 'web') {
      // For web, we need to use the proxy server
      url = await ProxyServerManager.getApiUrl(`yahoo-finance-history/${symbol}?interval=1d&range=1y`, directUrl);
    } else {
      url = directUrl;
    }
    
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
    
    if (!data?.chart?.result?.[0]?.indicators?.adjclose?.[0]?.adjclose) {
      throw new Error('No adjusted close data found');
    }
    
    const timestamps = data.chart.result[0].timestamp;
    const adjClosePrices = data.chart.result[0].indicators.adjclose[0].adjclose;
    
    
    // Get prices for all time periods
    const now = new Date();
    const oneWeekAgo = new Date(now);
    oneWeekAgo.setDate(now.getDate() - 7);
    const oneMonthAgo = new Date(now);
    oneMonthAgo.setMonth(now.getMonth() - 1);
    const threeMonthsAgo = new Date(now);
    threeMonthsAgo.setMonth(now.getMonth() - 3);
    const sixMonthsAgo = new Date(now);
    sixMonthsAgo.setMonth(now.getMonth() - 6);
    const oneYearAgo = new Date(now);
    oneYearAgo.setFullYear(now.getFullYear() - 1);
    
    // Calculate YTD (Year to Date) - January 1st of current year
    const ytdDate = new Date(now.getFullYear(), 0, 1); // January 1st of current year
    
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
      const price = adjClosePrices[closestIndex] || null;
      return price;
    };
    
    const oneWeekPrice = findClosestPrice(oneWeekAgo);
    const oneMonthPrice = findClosestPrice(oneMonthAgo);
    const threeMonthPrice = findClosestPrice(threeMonthsAgo);
    const sixMonthPrice = findClosestPrice(sixMonthsAgo);
    const oneYearPrice = findClosestPrice(oneYearAgo);
    const ytdPrice = findClosestPrice(ytdDate);
    
    return {
      '1w': oneWeekPrice,
      '1m': oneMonthPrice,
      '3m': threeMonthPrice,
      '6m': sixMonthPrice,
      '1y': oneYearPrice,
      'ytd': ytdPrice
    };
  } catch (error) {
    console.error(`[fetchRegularHistoricalData] Error for ${symbol}:`, error);
    return { 
      '1w': null, 
      '1m': null, 
      '3m': null, 
      '6m': null, 
      '1y': null, 
      'ytd': null 
    };
  }
};

// Helper function to fetch the earliest available price data
const fetchEarliestData = async (symbol: string): Promise<number | null> => {
  try {
    // Get the earliest data using max range and monthly interval
    const directUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1mo&range=max`;
    let url;
    
    if (Platform.OS === 'web') {
      // For web, use the proxy server
      url = await ProxyServerManager.getApiUrl(`yahoo-finance-history/${symbol}?interval=1mo&range=max`, directUrl);
     
    } else {
      url = directUrl;
    }
    
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
    
    if (!data?.chart?.result?.[0]) {
      throw new Error('No result data found');
    }
    
    const result = data.chart.result[0];
    
    // Check if we have timestamps and adjusted close prices
    if (!result.timestamp || !result.indicators?.adjclose?.[0]?.adjclose) {
      throw new Error('Missing timestamp or adjclose data');
    }
    
    const timestamps = result.timestamp;
    const adjClosePrices = result.indicators.adjclose[0].adjclose;
    
    // Get the earliest (first) price in the dataset
    if (adjClosePrices.length > 0) {
      // The first entry is the earliest available price
      const earliestPrice = adjClosePrices[0];
      return earliestPrice;
    }
    
    return null;
  } catch (error) {
    console.error(`[fetchEarliestData] Error for ${symbol}:`, error);
    if (error instanceof Error) {
      console.error(`[fetchEarliestData] Error message: ${error.message}`);
    }
    return null;
  }
};
