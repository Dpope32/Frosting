// src/stores/PortfolioStore.ts
import { create } from 'zustand';
import { useQuery } from '@tanstack/react-query';
import { portfolioData } from '../utils/Portfolio';
import { StorageUtils } from '../store/MMKV';

interface PortfolioState {
    totalValue: number | null;
    prices: Record<string, number>;
    lastUpdate?: Date;
    principal: number;
}

export const usePortfolioStore = create<PortfolioState>(() => ({
  totalValue: StorageUtils.get<number>('portfolio_total') ?? null,
  prices: StorageUtils.get<Record<string, number>>('portfolio_prices') ?? {},
  principal: StorageUtils.get<number>('portfolio_principal') ?? 1000
}));

export const updatePrincipal = (value: number) => {
  StorageUtils.set('portfolio_principal', value);
  usePortfolioStore.setState({ principal: value });
};

export const usePortfolioQuery = () => {
    return useQuery({
      queryKey: ['stock-prices'],
      queryFn: async () => {
        const cachedPrices = StorageUtils.get<Record<string, number>>('portfolio_prices');
        const cachedTotal = StorageUtils.get<number>('portfolio_total');
        
        try {
          const requests = portfolioData.map(async stock => {
            try {
              const url = `https://query1.finance.yahoo.com/v8/finance/chart/${stock.symbol}`;
             
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
              const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice;
              
              if (!price) {
                throw new Error('No price data found');
              }
  
              return { symbol: stock.symbol, price, error: null };
            } catch (error) {
              const cached = cachedPrices ?? {};
              return { 
                symbol: stock.symbol, 
                price: cached[stock.symbol] || 0,
                error 
              };
            }
          });
          
          const results = await Promise.allSettled(requests);
          const priceData: Record<string, number> = {};
          let total = 0;
          let hasErrors = false;
  
          results.forEach(result => {
            if (result.status === 'fulfilled') {
              const { symbol, price, error } = result.value;
              const stock = portfolioData.find(s => s.symbol === symbol);
              if (!stock) return;
    
              if (error) {
                hasErrors = true;
                if (__DEV__) console.warn(`[PortfolioStore] Error fetching ${symbol}:`, error);
              }
    
              priceData[symbol] = price;
              total += price * stock.quantity;
            } else {
              hasErrors = true;
              if (__DEV__) console.warn(`[PortfolioStore] Error fetching:`, result.reason);
            }
          });
          // Only store new data if we got at least some valid prices
          if (!hasErrors || Object.values(priceData).some(price => price > 0)) {
            StorageUtils.set('portfolio_prices', priceData);
            StorageUtils.set('portfolio_total', total);
            
            StorageUtils.set('portfolio_last_update', new Date().toISOString());
  
            usePortfolioStore.setState({
              prices: priceData,
              totalValue: total,
              lastUpdate: new Date()
            });
          }
  
          return priceData;
  
        } catch (error) {
          console.error('[PortfolioStore] Critical error:', error);
          
          // Return cached data if available
          if (cachedPrices) {
            const prices = cachedPrices;
            usePortfolioStore.setState({
              prices,
              totalValue: cachedTotal ?? 0
            });
            return prices;
          }
          
          // Last resort: initialize with zeros
          return Object.fromEntries(portfolioData.map(stock => [stock.symbol, 0]));
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
