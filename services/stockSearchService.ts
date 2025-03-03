import { Briefcase, TrendingUp, Zap, DollarSign, Building2, ShoppingCart, Smartphone, Pill, Coffee, Plane, Car, Droplet, Cpu, Wifi, Tv, Utensils, Landmark, Heart, Hammer, Leaf, Lightbulb, Truck, Globe, Film } from '@tamagui/lucide-icons';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import { Platform } from 'react-native';

export interface StockData {
  name: string;
  symbol: string;
  ipoPrice?: number;
}

// Raw stock data from CSV
let stocksData: StockData[] = [];

// Parse CSV data
export const initializeStocksData = async (csvData?: string) => {
  try {
    let data = csvData;
    
    // If no data was passed, try to load from file
    if (!data) {
      if (Platform.OS === 'web') {
        // For web, fetch from public folder
        try {
          const response = await fetch('/constants/stocks.csv');
          if (!response.ok) {
            throw new Error(`Failed to fetch CSV: ${response.status}`);
          }
          data = await response.text();
          console.log("Successfully loaded stocks.csv from web public folder");
        } catch (error) {
          console.error("Error loading stocks.csv on web:", error);
          useHardcodedStocks();
          return;
        }
      } else {
        // For native platforms, use FileSystem
        try {
          const uri = FileSystem.documentDirectory + 'constants/stocks.csv';
          data = await FileSystem.readAsStringAsync(uri);
          console.log("Successfully loaded stocks.csv from FileSystem");
        } catch (error) {
          console.error("Error loading stocks.csv on native:", error);
          useHardcodedStocks();
          return;
        }
      }
    }
    
    if (!data) {
      console.error("No CSV data available");
      useHardcodedStocks();
      return;
    }
    
    // Process the CSV data
    const lines = data.split('\n');
    
    // Determine if first line is a header
    const firstLine = lines[0].trim();
    const isHeader = firstLine.toLowerCase().includes('name') || 
                     firstLine.toLowerCase().includes('company') || 
                     firstLine.toLowerCase().includes('ticker') || 
                     firstLine.toLowerCase().includes('symbol');
    
    // Skip header if present
    const startLine = isHeader ? 1 : 0;
    
    const parsedStocks = lines.slice(startLine)
      .filter(line => line.trim() !== '')
      .map(line => {
        const parts = line.split(',');
        if (parts.length >= 2) {
          // Handle different CSV formats
          let name, symbol, ipoPrice;
          
          // Check if second column contains a stock symbol (usually uppercase and short)
          if (parts[1].trim().toUpperCase() === parts[1].trim() && parts[1].trim().length <= 5) {
            name = parts[0].trim();
            symbol = parts[1].trim();
            ipoPrice = parts.length > 2 ? parseFloat(parts[2]) || undefined : undefined;
          } else {
            // Handle reverse order (symbol first, name second)
            symbol = parts[0].trim();
            name = parts[1].trim();
            ipoPrice = parts.length > 2 ? parseFloat(parts[2]) || undefined : undefined;
          }
          
          return { name, symbol, ipoPrice };
        }
        return null;
      })
      .filter(item => item !== null && item.symbol) as StockData[];
    
    // Clean up duplicates by symbol
    const uniqueStocks: Record<string, StockData> = {};
    parsedStocks.forEach(stock => {
      if (stock.symbol && !uniqueStocks[stock.symbol]) {
        uniqueStocks[stock.symbol] = stock;
      }
    });
    
    stocksData = Object.values(uniqueStocks);
    console.log(`Initialized ${stocksData.length} stocks`);
    
    // If we still don't have enough stocks, use hardcoded ones
    if (stocksData.length < 10) {
      console.warn("Not enough stocks loaded from CSV, using hardcoded stocks");
      useHardcodedStocks();
    }
  } catch (error) {
    console.error('Error parsing CSV data:', error);
    useHardcodedStocks();
  }
};

// Fallback to hardcoded stocks if CSV fails
const useHardcodedStocks = () => {
  stocksData = [
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'KO', name: 'Coca-Cola Co.' },
    { symbol: 'NKE', name: 'Nike Inc.' },
    { symbol: 'MCD', name: 'McDonald\'s Corp.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'PYPL', name: 'PayPal Holdings' },
    { symbol: 'ADBE', name: 'Adobe Inc.' },
    { symbol: 'INTC', name: 'Intel Corp.' },
    { symbol: 'CRM', name: 'Salesforce Inc.' },
    { symbol: 'XOM', name: 'Exxon Mobil Corp.' },
    { symbol: 'CVX', name: 'Chevron Corp.' },
    { symbol: 'HD', name: 'Home Depot Inc.' }
  ];
  console.log(`Initialized ${stocksData.length} hardcoded stocks`);
};

// Search stocks by name or symbol
export const searchStocks = (query: string, limit: number = 10): StockData[] => {
  console.log(`Searching ${stocksData.length} stocks for: "${query}"`);
  
  if (!query || stocksData.length === 0) return [];
  
  const normalizedQuery = query.toLowerCase().trim();
  
  // Score and sort results
  const results = stocksData
    .map(stock => {
      const symbolMatch = stock.symbol.toLowerCase().indexOf(normalizedQuery);
      const nameMatch = stock.name.toLowerCase().indexOf(normalizedQuery);
      
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
      else if (nameMatch > 0 && (
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
  
  console.log(`Found ${results.length} results for "${query}"`);
  return results;
};

// Import the portfolio store to access the watchlist
import { usePortfolioStore } from '@/store/PortfolioStore';

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
  
  // Popular stocks
  const popularStocks = [
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc. (Class A)' },
    { symbol: 'META', name: 'Meta Platforms Inc.' },
    { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
    { symbol: 'V', name: 'Visa Inc.' },
    { symbol: 'JNJ', name: 'Johnson & Johnson' },
    { symbol: 'WMT', name: 'Walmart Inc.' },
    { symbol: 'PG', name: 'Procter & Gamble' },
    { symbol: 'MA', name: 'Mastercard Inc.' },
    { symbol: 'DIS', name: 'Walt Disney Co.' },
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NFLX', name: 'Netflix Inc.' },
    { symbol: 'PYPL', name: 'PayPal Holdings' },
    { symbol: 'INTC', name: 'Intel Corp.' }
  ];
  
  // Filter out stocks that are already in the watchlist
  const filtered = popularStocks.filter(stock => !watchlistedSymbols.includes(stock.symbol));
  console.log(`Filtered recommended stocks from ${popularStocks.length} to ${filtered.length}`);
  return filtered;
};

// Get an appropriate icon for a stock based on its symbol or industry
export const getIconForStock = (symbol: string) => {
  // Map symbols to brand icons or industry icons
  const iconMap: Record<string, any> = {
    // Tech
    'MSFT': { Component: FontAwesome5, name: 'microsoft', type: 'brand' },
    'GOOGL': { Component: FontAwesome, name: 'google', type: 'brand' },
    'GOOG': { Component: FontAwesome, name: 'google', type: 'brand' },
    'META': { Component: FontAwesome5, name: 'facebook', type: 'brand' },
    'AAPL': { Component: FontAwesome, name: 'apple', type: 'brand' },
    'AMZN': { Component: FontAwesome, name: 'amazon', type: 'brand' },
    'NFLX': { Component: FontAwesome5, name: 'netflix', type: 'brand' },
    'TSLA': { Component: FontAwesome5, name: 'tesla', type: 'brand' },
    'ORCL': { Component: Cpu, type: 'lucide' },
    'CRM': { Component: FontAwesome5, name: 'salesforce', type: 'brand' },
    'IBM': { Component: FontAwesome5, name: 'ibm', type: 'brand' },
    'NVDA': { Component: MaterialCommunityIcons, name: 'chip', type: 'material' },
    'INTC': { Component: MaterialCommunityIcons, name: 'cpu-64-bit', type: 'material' },
    'AMD': { Component: MaterialCommunityIcons, name: 'memory', type: 'material' },
    
    // Finance
    'JPM': { Component: Landmark, type: 'lucide' },
    'V': { Component: FontAwesome5, name: 'cc-visa', type: 'brand' },
    'MA': { Component: FontAwesome5, name: 'cc-mastercard', type: 'brand' },
    'BAC': { Component: Landmark, type: 'lucide' },
    'WFC': { Component: Landmark, type: 'lucide' },
    'GS': { Component: Briefcase, type: 'lucide' },
    'PYPL': { Component: FontAwesome5, name: 'paypal', type: 'brand' },
    
    // Healthcare
    'JNJ': { Component: Pill, type: 'lucide' },
    'PFE': { Component: Pill, type: 'lucide' },
    'MRK': { Component: Pill, type: 'lucide' },
    'UNH': { Component: Heart, type: 'lucide' },
    
    // Consumer
    'WMT': { Component: ShoppingCart, type: 'lucide' },
    'PG': { Component: ShoppingCart, type: 'lucide' },
    'KO': { Component: Coffee, type: 'lucide' },
    'PEP': { Component: Coffee, type: 'lucide' },
    'MCD': { Component: FontAwesome5, name: 'hamburger', type: 'solid' },
    'SBUX': { Component: FontAwesome5, name: 'coffee', type: 'solid' },
    
    // Entertainment
    'DIS': { Component: FontAwesome5, name: 'film', type: 'solid' }, // Disney icon
    
    // Energy
    'XOM': { Component: FontAwesome5, name: 'gas-pump', type: 'solid' },
    'CVX': { Component: Droplet, type: 'lucide' },
    
    // Auto
    'F': { Component: FontAwesome, name: 'car', type: 'solid' },
    'GM': { Component: Car, type: 'lucide' },
    
    // Travel
    'UAL': { Component: FontAwesome5, name: 'plane', type: 'solid' },
    'DAL': { Component: Plane, type: 'lucide' },
    
    // Industrial
    'CAT': { Component: Truck, type: 'lucide' },
    'DE': { Component: Truck, type: 'lucide' },
    'MMM': { Component: Hammer, type: 'lucide' },
    
    // Utilities
    'NEE': { Component: Lightbulb, type: 'lucide' },
    'SO': { Component: Lightbulb, type: 'lucide' },
    
    // Real Estate
    'SPG': { Component: Building2, type: 'lucide' },
    'AMT': { Component: Building2, type: 'lucide' },
  };
  
  // Return specific icon if available
  if (iconMap[symbol]) {
    return iconMap[symbol];
  }
  
  // Default to a generic icon based on first letter
  const firstChar = symbol.charAt(0).toLowerCase();
  
  if (['a', 'b', 'c'].includes(firstChar)) return { Component: Building2, type: 'lucide' };
  if (['d', 'e', 'f'].includes(firstChar)) return { Component: DollarSign, type: 'lucide' };
  if (['g', 'h', 'i'].includes(firstChar)) return { Component: Globe, type: 'lucide' };
  if (['j', 'k', 'l'].includes(firstChar)) return { Component: Landmark, type: 'lucide' };
  if (['m', 'n', 'o'].includes(firstChar)) return { Component: ShoppingCart, type: 'lucide' };
  if (['p', 'q', 'r'].includes(firstChar)) return { Component: Pill, type: 'lucide' };
  if (['s', 't', 'u'].includes(firstChar)) return { Component: TrendingUp, type: 'lucide' };
  if (['v', 'w', 'x', 'y', 'z'].includes(firstChar)) return { Component: Zap, type: 'lucide' };
  
  // Default fallback
  return { Component: TrendingUp, type: 'lucide' };
};
