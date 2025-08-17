// Enhanced PortfolioStore.ts with sync support and merging
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { portfolioData, updatePortfolioData } from '../utils/Portfolio';
import { StorageUtils, createPersistStorage } from '../store/AsyncStorage';
import ProxyServerManager from '../utils/ProxyServerManager';
import { Stock } from '@/types/stocks'; 

const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

// Separate interface for persisted data (only data, no methods)
interface PortfolioPersistedState {
  totalValue: number | null;
  prices: Record<string, number>;
  principal: number;
  watchlist: string[];
  holdings: Stock[];
  historicalData: Record<string, {
    '1d': number | null;
    '1w': number | null;
    '1m': number | null;
    '3m': number | null;
    '6m': number | null;
    '1y': number | null;
    'ytd': number | null;
    'earliest': number | null; 
  }>;
  isSyncEnabled: boolean;
}

interface PortfolioState extends PortfolioPersistedState {
    lastUpdate?: Date;
    togglePortfolioSync: () => void;
    // Add methods to manage holdings
    addHolding: (stock: Stock) => void;
    removeHolding: (symbol: string) => void;
    updateHolding: (symbol: string, updates: Partial<Stock>) => void;
    syncHoldingsWithPortfolioData: () => void;
    // Add sync method
    hydrateFromSync?: (syncedData: { 
      watchlist?: string[];
      historicalData?: Record<string, any>;
      totalValue?: number | null;
      prices?: Record<string, number>;
      principal?: number;
      portfolioHoldings?: Stock[];
    }) => void;
}

// Add timestamp support to Stock interface (we'll need this)
interface TimestampedStock extends Stock {
  addedAt?: string;
  updatedAt?: string;
}

// Initialize with default values using Zustand persist
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      totalValue: null,
      prices: {},
      principal: 1000,
      watchlist: [],
      holdings: [], // Initialize empty holdings array
      historicalData: {},
      isSyncEnabled: false,
      
      togglePortfolioSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
            return { isSyncEnabled: newSyncState };
        });
      },

      addHolding: (stock: Stock) => set((state) => {
        const newHoldings = [...state.holdings, stock];
        return { holdings: newHoldings };
      }),

      removeHolding: (symbol: string) => set((state) => {
        const newHoldings = state.holdings.filter(stock => stock.symbol !== symbol);
        return { holdings: newHoldings };
      }),

      updateHolding: (symbol: string, updates: Partial<Stock>) => set((state) => {
        const newHoldings = state.holdings.map(stock => 
          stock.symbol === symbol ? { ...stock, ...updates } : stock
        );
        return { holdings: newHoldings };
      }),

      syncHoldingsWithPortfolioData: () => set((state) => {
        const currentPortfolioData = [...portfolioData];
        return { holdings: currentPortfolioData };
      }),

      hydrateFromSync: async (syncedData: { 
        watchlist?: string[];
        historicalData?: Record<string, any>;
        totalValue?: number | null;
        prices?: Record<string, number>;
        principal?: number;
        portfolioHoldings?: Stock[]; 
        lastUpdated?: number;
      }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        
        if (!currentSyncEnabledState) {
          addSyncLog('Portfolio sync is disabled, skipping hydration for PortfolioStore.', 'info');
          return;
        }
      
        try {
          const currentPortfolioData = [...portfolioData];
          const currentState = get();
          
          let mergedPortfolioData = [...currentPortfolioData];
          let holdingsUpdated = 0;
          let holdingsAdded = 0;
          let holdingsDeleted = 0;
      
          // FIXED: Proper sync with deletion support
          if (syncedData.portfolioHoldings && Array.isArray(syncedData.portfolioHoldings)) {
            addSyncLog(`Syncing ${syncedData.portfolioHoldings.length} holdings from sync with ${currentPortfolioData.length} local holdings`, 'info');
            
            // Create maps for easy lookup
            const currentHoldingsMap = new Map(
              currentPortfolioData.map(stock => [stock.symbol, stock])
            );
            const incomingHoldingsMap = new Map(
              syncedData.portfolioHoldings.map(stock => [stock.symbol, stock])
            );
            
            // Start with empty map and build the final result
            const finalHoldingsMap = new Map<string, Stock>();
            
            // Process ALL incoming holdings (this is the source of truth)
            for (const incomingStock of syncedData.portfolioHoldings) {
              const existingStock = currentHoldingsMap.get(incomingStock.symbol);
              
              if (existingStock) {
                // Stock exists locally - compare timestamps if available
                const localTimestamp = existingStock.updatedAt ? new Date(existingStock.updatedAt).getTime() : 0;
                const incomingTimestamp = incomingStock.updatedAt ? new Date(incomingStock.updatedAt).getTime() : 0;
                
                if (incomingTimestamp > localTimestamp) {
                  // Incoming is newer, use it
                  finalHoldingsMap.set(incomingStock.symbol, {
                    ...existingStock,
                    ...incomingStock,
                    updatedAt: incomingStock.updatedAt || new Date().toISOString()
                  });
                  holdingsUpdated++;
                } else if (incomingTimestamp === localTimestamp || !existingStock.updatedAt || !incomingStock.updatedAt) {
                  // Same timestamp or no timestamps - merge conservatively (prefer higher quantity)
                  const mergedStock: Stock = {
                    ...existingStock,
                    quantity: Math.max(existingStock.quantity, incomingStock.quantity),
                    updatedAt: new Date().toISOString()
                  };
                  finalHoldingsMap.set(incomingStock.symbol, mergedStock);
                } else {
                  // Local is newer, but still include it in final result
                  finalHoldingsMap.set(incomingStock.symbol, existingStock);
                }
              } else {
                // New stock from sync - add it
                const newStock: Stock = {
                  ...incomingStock,
                  addedAt: incomingStock.addedAt || new Date().toISOString(),
                  updatedAt: incomingStock.updatedAt || new Date().toISOString()
                };
                finalHoldingsMap.set(incomingStock.symbol, newStock);
                holdingsAdded++;
              }
            }
            
            // Check for deletions (stocks that exist locally but not in incoming data)
            for (const [symbol, localStock] of currentHoldingsMap) {
              if (!incomingHoldingsMap.has(symbol)) {
                holdingsDeleted++;
              }
            }
            
            // Convert back to array
            mergedPortfolioData = Array.from(finalHoldingsMap.values());
            
            // Update the portfolio data
            await updatePortfolioData(mergedPortfolioData);
          }
      
          // Merge other portfolio data
          const newState: Partial<PortfolioState> = {};
      
          // Merge watchlist (combine and deduplicate)
          if (syncedData.watchlist && Array.isArray(syncedData.watchlist)) {
            const combinedWatchlist = [...new Set([...currentState.watchlist, ...syncedData.watchlist])];
            newState.watchlist = combinedWatchlist;
          }
      
          // Use synced historical data if available
          if (syncedData.historicalData) {
            newState.historicalData = { ...currentState.historicalData, ...syncedData.historicalData };
          }
      
          // Use synced prices if available  
          if (syncedData.prices) {
            newState.prices = { ...currentState.prices, ...syncedData.prices };
          }
      
          // Use higher principal value (assumes user wants to keep the higher amount)
          if (syncedData.principal !== undefined && syncedData.principal > currentState.principal) {
            newState.principal = syncedData.principal;
          }
      
          // Always recalculate total value if we updated holdings
          if (holdingsAdded > 0 || holdingsUpdated > 0) {
            const finalPrices = newState.prices || currentState.prices;
            let newTotal = 0;
            mergedPortfolioData.forEach((stock) => {
              const price = finalPrices[stock.symbol] || 0;
              newTotal += price * stock.quantity;
            });
            newState.totalValue = newTotal;
            newState.lastUpdate = new Date();
          }
      
          // Update the store with merged data
          set(newState);
      
        } catch (error) {
          console.error('Error hydrating PortfolioStore:', error);
        }
      } 
    }),
    {
      name: 'portfolio-store',
      storage: createPersistStorage<PortfolioPersistedState>(),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Sync holdings with portfolioData on hydration
          const currentPortfolioData = [...portfolioData];
          if (state.holdings.length === 0 && currentPortfolioData.length > 0) {
            state.holdings = currentPortfolioData;
            try {
              getAddSyncLog()(`[PortfolioStore] Initialized holdings from portfolioData: ${currentPortfolioData.length} items`, 'info');
            } catch (e) { /* ignore */ }
          }
        }
      },
      partialize: (state) => ({
        totalValue: state.totalValue,
        prices: state.prices,
        principal: state.principal,
        watchlist: state.watchlist,
        holdings: state.holdings, // Include holdings in persistence
        historicalData: state.historicalData,
        isSyncEnabled: state.isSyncEnabled
      }),
    }
  )
);

// Update principal function
export const updatePrincipal = async (value: number) => {
  await StorageUtils.set('portfolio_principal', value);
  usePortfolioStore.setState({ principal: value });
};

// Add to watchlist function
export const addToWatchlist = async (symbol: string) => {
  const currentWatchlist = usePortfolioStore.getState().watchlist;
  if (!currentWatchlist.includes(symbol)) {
    const updatedWatchlist = [...currentWatchlist, symbol];
    await StorageUtils.set('portfolio_watchlist', updatedWatchlist);
    usePortfolioStore.setState({ watchlist: updatedWatchlist });
  }
};

// Remove from watchlist function
export const removeFromWatchlist = async (symbol: string) => {
  const currentWatchlist = usePortfolioStore.getState().watchlist;
  const updatedWatchlist = currentWatchlist.filter(s => s !== symbol);
  await StorageUtils.set('portfolio_watchlist', updatedWatchlist);
  usePortfolioStore.setState({ watchlist: updatedWatchlist });
};

// Add function to add stock with timestamp
export const addToPortfolio = async (stock: Omit<Stock, 'addedAt' | 'updatedAt' | 'createdAt'>) => {
  try {
    const timestampedStock: Stock = {
      ...stock,
      addedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    // Add to existing portfolio
    const updatedPortfolio = [...portfolioData, timestampedStock];
    
    // Update the portfolio data
    await updatePortfolioData(updatedPortfolio);
    
    // Update the store holdings (only for premium users with sync enabled)
    const portfolioStore = usePortfolioStore.getState();
    if (portfolioStore.isSyncEnabled) {
      try {
        const { useUserStore } = require('./UserStore');
        const isPremium = useUserStore.getState().preferences.premium === true;
        if (isPremium) {
          portfolioStore.addHolding(timestampedStock);
        }
      } catch (e) {
        // UserStore might not be available during initialization
        console.log('UserStore not available for premium check');
      }
    }
    
    // Recalculate total value
    const prices = usePortfolioStore.getState().prices;
    let newTotal = 0;
    updatedPortfolio.forEach((s) => {
      const price = prices[s.symbol] || 0;
      newTotal += price * s.quantity;
    });
    
    // Update the store state
    usePortfolioStore.setState({ 
      totalValue: newTotal,
      lastUpdate: new Date()
    });
    
    // Log the addition for sync
    const addSyncLog = getAddSyncLog();
    addSyncLog(`Stock added to portfolio: ${stock.symbol} (${stock.quantity} shares)`, 'info');
    
    return timestampedStock;
    
  } catch (error) {
    console.error('Error adding stock to portfolio:', error);
    throw error;
  }
};

// Also update the removeFromPortfolio to handle timestamps
export const removeFromPortfolio = async (symbol: string) => {
  try {
    // Filter out the stock with the given symbol
    const updatedPortfolio = [...portfolioData].filter((stock) => stock.symbol !== symbol);
    
    // Update the portfolio data
    await updatePortfolioData(updatedPortfolio);
    
    // Update the store holdings
    usePortfolioStore.getState().removeHolding(symbol);
    
    // Recalculate total value
    const prices = usePortfolioStore.getState().prices;
    let newTotal = 0;
    updatedPortfolio.forEach((stock) => {
      const price = prices[stock.symbol] || 0;
      newTotal += price * stock.quantity;
    });
    
    // Update the store state
    usePortfolioStore.setState({ 
      totalValue: newTotal,
      lastUpdate: new Date()
    });
    
    // Log the removal for sync
    const addSyncLog = getAddSyncLog();
    addSyncLog(`Stock removed from portfolio: ${symbol}`, 'info');
    
  } catch (error) {
    console.error('Error removing stock from portfolio:', error);
  }
};

// Rest of the existing query and fetch functions remain the same...
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
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2,
    retryDelay: (attempt: number) => Math.min(1000 * 2 ** attempt, 30000),
    refetchOnReconnect: true,
    refetchOnWindowFocus: false,  
  });
};

// Keep all the existing fetch functions...
const fetchHistoricalDataWithEarliest = async (
  symbols: string[], 
  cachedData: Record<string, any> = {}
): Promise<Record<string, { '1d': number | null; '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }>> => {
  
  const result: Record<string, { '1d': number | null; '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }> = {};

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
            '1d': null,
            '1w': null, 
            '1m': null, 
            '3m': null, 
            '6m': null, 
            '1y': null, 
            'ytd': null, 
            'earliest': null 
          } as { '1d': number | null; '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null };
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
        '1d': null,
        '1w': null, 
        '1m': null, 
        '3m': null, 
        '6m': null, 
        '1y': null, 
        'ytd': null, 
        'earliest': null 
      };
      return acc;
    }, {} as Record<string, { '1d': number | null; '1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null; 'earliest': number | null }>);
  }
};

// Helper function to fetch regular historical data (1w, 1m, 3m, 6m, 1y, ytd)
const fetchRegularHistoricalData = async (symbol: string): Promise<{ '1d': number | null;'1w': number | null; '1m': number | null; '3m': number | null; '6m': number | null; '1y': number | null; 'ytd': number | null }> => {
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
    const oneDayAgo = new Date(now);
    oneDayAgo.setDate(now.getDate() -1)
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
    const oneDayPrice = findClosestPrice(oneDayAgo);
    const oneWeekPrice = findClosestPrice(oneWeekAgo);
    const oneMonthPrice = findClosestPrice(oneMonthAgo);
    const threeMonthPrice = findClosestPrice(threeMonthsAgo);
    const sixMonthPrice = findClosestPrice(sixMonthsAgo);
    const oneYearPrice = findClosestPrice(oneYearAgo);
    const ytdPrice = findClosestPrice(ytdDate);
    
    return {
      '1d': oneDayPrice,
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
      '1d': null,
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