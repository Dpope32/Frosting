import { Briefcase, TrendingUp, Zap, DollarSign, Building2, ShoppingCart, Pill, Coffee, Plane, Car, Droplet, Cpu, Landmark, Heart, Hammer, Lightbulb, Truck, Globe } from '@tamagui/lucide-icons';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import { stocksData, StockData } from '../constants/stocks';
import { popularStocks } from '../constants/popularStocks';
import { usePortfolioStore } from '@/store/PortfolioStore';
// Initialize stocks data - no longer needed to parse CSV since we import directly from TS file
export const initializeStocksData = async () => {
  console.log(`Using ${stocksData.length} stocks from stocks.ts file`);
  return stocksData;
};

// Search stocks by name or symbol
export const searchStocks = (query: string, limit: number = 10, excludePortfolio: boolean = true): StockData[] => {
 // console.log(`Searching ${stocksData.length} stocks for: "${query}"`);
  
  if (!query) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Get current portfolio stocks to exclude if needed
  const portfolioSymbols: string[] = [];
  if (excludePortfolio) {
    try {
      // Import dynamically to avoid circular dependencies
      const { portfolioData } = require('../utils/Portfolio');
      portfolioSymbols.push(...portfolioData.map((stock: any) => stock.symbol));
    } catch (error) {
      console.error('Error getting portfolio data for filtering:', error);
    }
  }
  
  // Score and sort results
  const results = stocksData
    .map(stock => {
      // Skip stocks already in portfolio if excludePortfolio is true
      if (excludePortfolio && portfolioSymbols.includes(stock.symbol)) {
        return { stock, score: 1000 }; // Will be filtered out
      }
      
      const symbolMatch = stock.symbol.toLowerCase().indexOf(normalizedQuery);
      const nameMatch = stock.name ? stock.name.toLowerCase().indexOf(normalizedQuery) : -1;
      
      // Calculate score (lower is better)
      let score = 1000;
      
      // Exact symbol match is best
      if (stock.symbol.toLowerCase() === normalizedQuery) {
        score = 0;
      }
      // Symbol starts with query is next best
      else if (symbolMatch === 0) {
        score = 1;
      }
      // Name starts with query
      else if (nameMatch === 0) {
        score = 2;
      }
      // Name contains query as a whole word
      else if (nameMatch > 0 && stock.name && (
        nameMatch === 0 || 
        stock.name.toLowerCase()[nameMatch-1] === ' ' || 
        stock.name.toLowerCase()[nameMatch-1] === '('
      )) {
        score = 3;
      }
      // Symbol contains query
      else if (symbolMatch > 0) {
        score = 4 + symbolMatch;
      }
      // Name contains query
      else if (nameMatch > 0) {
        score = 5 + nameMatch;
      }
      // No match
      else {
        score = 1000;
      }
      
      return { stock, score };
    })
    .filter(item => item.score < 1000) // Only include matches
    .sort((a, b) => a.score - b.score) // Sort by score
    .slice(0, limit) // Limit results
    .map(item => item.stock); // Extract stock data
  
//  console.log(`Found ${results.length} results for "${query}"`);
  return results;
};

// Get currently watchlisted stocks
export const getWatchlistedStocks = (): string[] => {
  try {
    // Get watchlist directly from the store
    const watchlist = usePortfolioStore.getState().watchlist;
    console.log("Getting watchlist from store:", watchlist);
    return watchlist || [];
  } catch (error) {
    console.error('Error getting watchlisted stocks:', error);
    return [];
  }
};

// Get popular/recommended stocks (excluding those in the watchlist)
export const getRecommendedStocks = (explicitWatchlist?: string[]): StockData[] => {
  // Get currently watchlisted symbols
  const watchlistedSymbols = explicitWatchlist || getWatchlistedStocks();
  
  console.log("Filtering recommended stocks. Watchlisted symbols:", watchlistedSymbols);
  
  // Filter out stocks that are already in the watchlist
  const filtered = popularStocks.filter(stock => !watchlistedSymbols.includes(stock.symbol));
  console.log(`Filtered recommended stocks from ${popularStocks.length} to ${filtered.length}`);
  return filtered;
};
