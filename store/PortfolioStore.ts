// Enhanced PortfolioStore.ts with sync support and merging
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useQuery } from '@tanstack/react-query';
import { Platform } from 'react-native';
import { portfolioData, updatePortfolioData } from '../utils/Portfolio';
import { StorageUtils, createPersistStorage } from '../store/AsyncStorage';
import ProxyServerManager from '../utils/ProxyServerManager';
import { Stock } from '@/types/stocks'; // Import Stock interface

// Add sync log import
const getAddSyncLog = () => require('@/components/sync/syncUtils').addSyncLog;

interface PortfolioState {
    totalValue: number | null;
    prices: Record<string, number>;
    lastUpdate?: Date;
    principal: number;
    isSyncEnabled: boolean;
    togglePortfolioSync: () => void;
    watchlist: string[];
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

// Initialize with default values using Zustand persist
export const usePortfolioStore = create<PortfolioState>()(
  persist(
    (set, get) => ({
      totalValue: null,
      prices: {},
      principal: 1000,
      watchlist: [],
      historicalData: {},
      isSyncEnabled: false,
      
      togglePortfolioSync: () => {
        set((state) => {
          const newSyncState = !state.isSyncEnabled;
          try {
            getAddSyncLog()(`Portfolio sync ${newSyncState ? 'enabled' : 'disabled'}`, 'info');
          } catch (e) { /* ignore */ }
          return { isSyncEnabled: newSyncState };
        });
      },

      hydrateFromSync: async (syncedData: { 
        watchlist?: string[];
        historicalData?: Record<string, any>;
        totalValue?: number | null;
        prices?: Record<string, number>;
        principal?: number;
        portfolioHoldings?: Stock[];
      }) => {
        const addSyncLog = getAddSyncLog();
        const currentSyncEnabledState = get().isSyncEnabled;
        
        if (!currentSyncEnabledState) {
          addSyncLog('Portfolio sync is disabled, skipping hydration for PortfolioStore.', 'info');
          return;
        }

        addSyncLog('🔄 Hydrating PortfolioStore from sync...', 'info');

        try {
          // Get current local portfolio data
          const currentPortfolioData = [...portfolioData];
          let mergedPortfolioData = [...currentPortfolioData];
          let holdingsMerged = 0;
          let holdingsAdded = 0;

          // Merge portfolio holdings if provided
          if (syncedData.portfolioHoldings && Array.isArray(syncedData.portfolioHoldings)) {
            addSyncLog(`Merging ${syncedData.portfolioHoldings.length} portfolio holdings from sync`, 'info');
            
            syncedData.portfolioHoldings.forEach(syncedHolding => {
              const existingIndex = mergedPortfolioData.findIndex(
                local => local.symbol === syncedHolding.symbol
              );
              
              if (existingIndex !== -1) {
                // Combine quantities for existing holdings
                const oldQuantity = mergedPortfolioData[existingIndex].quantity;
                mergedPortfolioData[existingIndex].quantity += syncedHolding.quantity;
                
                // Update purchase price if synced data has it and local doesn't, or use weighted average
                if (syncedHolding.purchasePrice !== undefined) {
                  const localPrice = mergedPortfolioData[existingIndex].purchasePrice;
                  if (localPrice === undefined) {
                    mergedPortfolioData[existingIndex].purchasePrice = syncedHolding.purchasePrice;
                  } else {
                    // Calculate weighted average purchase price
                    const totalShares = mergedPortfolioData[existingIndex].quantity;
                    const weightedPrice = ((localPrice * oldQuantity) + (syncedHolding.purchasePrice * syncedHolding.quantity)) / totalShares;
                    mergedPortfolioData[existingIndex].purchasePrice = weightedPrice;
                  }
                }
                
                addSyncLog(
                  `Combined ${syncedHolding.symbol}: ${oldQuantity} + ${syncedHolding.quantity} = ${mergedPortfolioData[existingIndex].quantity}`, 
                  'verbose'
                );
                holdingsMerged++;
              } else {
                // Add new holding with all required fields
                mergedPortfolioData.push({
                  symbol: syncedHolding.symbol,
                  quantity: syncedHolding.quantity,
                  name: syncedHolding.name,
                  purchasePrice: syncedHolding.purchasePrice
                });
                addSyncLog(`Added new holding: ${syncedHolding.symbol} (${syncedHolding.quantity} shares)`, 'verbose');
                holdingsAdded++;
              }
            });

            // Update the portfolio data if there were changes
            if (holdingsMerged > 0 || holdingsAdded > 0) {
              await updatePortfolioData(mergedPortfolioData);
              addSyncLog(`Portfolio holdings updated: ${holdingsAdded} added, ${holdingsMerged} merged`, 'success');
            }
          }

          // Merge other portfolio data
          const currentState = get();
          const newState: Partial<PortfolioState> = {};

          // Merge watchlist (combine and deduplicate)
          if (syncedData.watchlist && Array.isArray(syncedData.watchlist)) {
            const combinedWatchlist = [...new Set([...currentState.watchlist, ...syncedData.watchlist])];
            newState.watchlist = combinedWatchlist;
            addSyncLog(`Watchlist merged: ${combinedWatchlist.length} total symbols`, 'verbose');
          }

          // Use synced historical data if available and newer
          if (syncedData.historicalData) {
            newState.historicalData = { ...currentState.historicalData, ...syncedData.historicalData };
            addSyncLog('Historical data merged from sync', 'verbose');
          }

          // Use synced prices if available
          if (syncedData.prices) {
            newState.prices = { ...currentState.prices, ...syncedData.prices };
            addSyncLog(`Prices merged: ${Object.keys(syncedData.prices).length} symbols`, 'verbose');
          }

          // Use higher principal value (assumes user wants to keep the higher amount)
          if (syncedData.principal !== undefined && syncedData.principal > currentState.principal) {
            newState.principal = syncedData.principal;
            addSyncLog(`Principal updated: $${currentState.principal} → $${syncedData.principal}`, 'info');
          }

          // Recalculate total value with merged data
          if (newState.prices || holdingsMerged > 0 || holdingsAdded > 0) {
            const finalPrices = newState.prices || currentState.prices;
            let newTotal = 0;
            mergedPortfolioData.forEach((stock) => {
              const price = finalPrices[stock.symbol] || 0;
              newTotal += price * stock.quantity;
            });
            newState.totalValue = newTotal;
            addSyncLog(`Portfolio total value recalculated: $${newTotal.toFixed(2)}`, 'info');
          }

          // Update the store with merged data
          set(newState);

          addSyncLog(
            `✅ Portfolio hydrated successfully: ${holdingsAdded + holdingsMerged} holdings processed, ${(newState.watchlist || currentState.watchlist).length} watchlist items`,
            'success'
          );

        } catch (error) {
          addSyncLog(
            `❌ Error hydrating PortfolioStore: ${error instanceof Error ? error.message : String(error)}`,
            'error'
          );
        }
      }
    }),
    {
      name: 'portfolio-store',
      storage: createPersistStorage<PortfolioState>(),
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
    usePortfolioStore.setState({ 
      totalValue: newTotal,
      lastUpdate: new Date()
    });
    
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
    retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30000),
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