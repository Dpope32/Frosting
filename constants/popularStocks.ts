import { Briefcase, TrendingUp, Zap, DollarSign, Building2, ShoppingCart, Pill, Coffee, Plane, Car, Droplet, Cpu, Landmark, Heart, Hammer, Lightbulb, Truck, Globe } from '@tamagui/lucide-icons';
import { FontAwesome, FontAwesome5, MaterialCommunityIcons } from '@expo/vector-icons';

export const popularStocks = [
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

export const getIconForStock = (symbol: string) => {
    const iconMap: Record<string, any> = {
      // Tech
      'MSFT': { Component: FontAwesome5, name: 'microsoft', type: 'brand' },
      'GOOGL': { Component: FontAwesome, name: 'google', type: 'brand' },
      'GOOG': { Component: FontAwesome, name: 'google', type: 'brand' },
      'META': { Component: FontAwesome5, name: 'facebook', type: 'brand' },
      'AAPL': { Component: FontAwesome, name: 'apple', type: 'brand' },
      'AMZN': { Component: FontAwesome, name: 'amazon', type: 'brand' },
      'NFLX': { Component: FontAwesome5, name: 'netflix', type: 'brand' },
      'TSLA': { Component: MaterialCommunityIcons, name: 'car-sports', type: 'material' },
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
  