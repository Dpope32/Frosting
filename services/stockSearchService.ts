import { stocksData, StockData } from '../constants/stocks';
import { popularStocks } from '../constants/popularStocks';
import { usePortfolioStore } from '@/store';

export const initializeStocksData = async () => {
  return stocksData;
};

export const searchStocks = (query: string, limit: number = 10, excludePortfolio: boolean = true): StockData[] => {
  if (!query) return [];
  const normalizedQuery = query.toLowerCase().trim();
  const portfolioSymbols: string[] = [];
  if (excludePortfolio) {
    try {
      const { portfolioData } = require('../utils/Portfolio');
      portfolioSymbols.push(...portfolioData.map((stock: any) => stock.symbol));
    } catch (error) {
      console.error('Error getting portfolio data for filtering:', error);
    }
  }
  
  const results = stocksData
    .map(stock => {
      if (excludePortfolio && portfolioSymbols.includes(stock.symbol)) {
        return { stock, score: 1000 }; 
      }
      const symbolMatch = stock.symbol.toLowerCase().indexOf(normalizedQuery);
      const nameMatch = stock.name ? stock.name.toLowerCase().indexOf(normalizedQuery) : -1;
      let score = 1000;
      if (stock.symbol.toLowerCase() === normalizedQuery) {
        score = 0;
      }
      else if (symbolMatch === 0) {
        score = 1;
      }
      else if (nameMatch === 0) {
        score = 2;
      }
      else if (nameMatch > 0 && stock.name && (
        nameMatch === 0 || 
        stock.name.toLowerCase()[nameMatch-1] === ' ' || 
        stock.name.toLowerCase()[nameMatch-1] === '('
      )) {
        score = 3;
      }
      else if (symbolMatch > 0) {
        score = 4 + symbolMatch;
      }
      else if (nameMatch > 0) {
        score = 5 + nameMatch;
      }
      else {
        score = 1000;
      }
      
      return { stock, score };
    })
    .filter(item => item.score < 1000) 
    .sort((a, b) => a.score - b.score) 
    .slice(0, limit) 
    .map(item => item.stock); 
  
  return results;
};

export const getWatchlistedStocks = (): string[] => {
  try {
    const watchlist = usePortfolioStore.getState().watchlist;
    return watchlist || [];
  } catch (error) {
    console.error('Error getting watchlisted stocks:', error);
    return [];
  }
};

export const getRecommendedStocks = (explicitWatchlist?: string[]): StockData[] => {
  const watchlistedSymbols = explicitWatchlist || getWatchlistedStocks();
  const filtered = popularStocks.filter(stock => !watchlistedSymbols.includes(stock.symbol));
  return filtered;
};
