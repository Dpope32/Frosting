import { FontAwesome, FontAwesome5, MaterialCommunityIcons, MaterialIcons, Ionicons, Feather, Foundation, Entypo } from '@expo/vector-icons';

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
      'NFLX': { Component: MaterialCommunityIcons, name: 'netflix', type: 'material' },
      'TSLA': { Component: MaterialCommunityIcons, name: 'car-sports', type: 'material' },
      'ORCL': { Component: MaterialCommunityIcons, name: 'cpu-64-bit', type: 'material' },
      'CRM': { Component: FontAwesome5, name: 'salesforce', type: 'brand' },
      'IBM': { Component: MaterialCommunityIcons, name: 'ibm', type: 'material' },
      'NVDA': { Component: MaterialCommunityIcons, name: 'chip', type: 'material' },
      'INTC': { Component: MaterialCommunityIcons, name: 'cpu-64-bit', type: 'material' },
      'AMD': { Component: MaterialCommunityIcons, name: 'memory', type: 'material' },
      'ADBE': { Component: FontAwesome5, name: 'adobe', type: 'brand' },
      'CSCO': { Component: MaterialCommunityIcons, name: 'router-network', type: 'material' },
      'AVGO': { Component: MaterialCommunityIcons, name: 'integrated-circuit-chip', type: 'material' },
      'TXN': { Component: MaterialCommunityIcons, name: 'resistor', type: 'material' },
      'QCOM': { Component: MaterialCommunityIcons, name: 'cellphone-link', type: 'material' },
      
      // Finance
      'JPM': { Component: FontAwesome5, name: 'landmark', type: 'solid' },
      'V': { Component: FontAwesome5, name: 'cc-visa', type: 'brand' },
      'MA': { Component: FontAwesome5, name: 'cc-mastercard', type: 'brand' },
      'BAC': { Component: MaterialCommunityIcons, name: 'bank', type: 'material' },
      'WFC': { Component: MaterialCommunityIcons, name: 'bank', type: 'material' },
      'GS': { Component: MaterialIcons, name: 'business-center', type: 'material' },
      'PYPL': { Component: FontAwesome5, name: 'paypal', type: 'brand' },
      'AXP': { Component: FontAwesome5, name: 'cc-amex', type: 'brand' },
      'C': { Component: MaterialCommunityIcons, name: 'bank-outline', type: 'material' },
      'MS': { Component: MaterialCommunityIcons, name: 'finance', type: 'material' },
      'BRK.B': { Component: MaterialIcons, name: 'account-balance', type: 'material' },
      
      // Healthcare
      'JNJ': { Component: MaterialCommunityIcons, name: 'pill', type: 'material' },
      'PFE': { Component: MaterialCommunityIcons, name: 'pill', type: 'material' },
      'MRK': { Component: MaterialCommunityIcons, name: 'pill', type: 'material' },
      'UNH': { Component: FontAwesome5, name: 'heartbeat', type: 'solid' },
      'CVS': { Component: MaterialCommunityIcons, name: 'pharmacy', type: 'material' },
      'ABT': { Component: MaterialCommunityIcons, name: 'medical-bag', type: 'material' },
      'TMO': { Component: MaterialCommunityIcons, name: 'microscope', type: 'material' },
      'DHR': { Component: MaterialCommunityIcons, name: 'test-tube', type: 'material' },
      'LLY': { Component: MaterialCommunityIcons, name: 'needle', type: 'material' },
      'BMY': { Component: MaterialCommunityIcons, name: 'pill-multiple', type: 'material' },
      
      // Consumer
      'WMT': { Component: MaterialIcons, name: 'shopping-cart', type: 'material' },
      'PG': { Component: MaterialIcons, name: 'shopping-basket', type: 'material' },
      'KO': { Component: MaterialCommunityIcons, name: 'bottle-soda', type: 'material' },
      'PEP': { Component: MaterialCommunityIcons, name: 'bottle-soda-classic', type: 'material' },
      'MCD': { Component: MaterialCommunityIcons, name: 'hamburger', type: 'material' },
      'SBUX': { Component: MaterialCommunityIcons, name: 'coffee', type: 'material' },
      'NKE': { Component: MaterialCommunityIcons, name: 'shoe-sneaker', type: 'material' },
      'HD': { Component: MaterialCommunityIcons, name: 'hammer', type: 'material' },
      'LOW': { Component: MaterialCommunityIcons, name: 'saw-blade', type: 'material' },
      'TGT': { Component: MaterialCommunityIcons, name: 'target', type: 'material' },
      'COST': { Component: MaterialCommunityIcons, name: 'warehouse', type: 'material' },
      
      // Entertainment
      'DIS': { Component: MaterialCommunityIcons, name: 'movie-open', type: 'material' },
      'CMCSA': { Component: MaterialCommunityIcons, name: 'television', type: 'material' },
      'SPOT': { Component: FontAwesome5, name: 'spotify', type: 'brand' },
      'ROKU': { Component: MaterialCommunityIcons, name: 'remote-tv', type: 'material' },
      
      // Energy
      'XOM': { Component: MaterialCommunityIcons, name: 'gas-station', type: 'material' },
      'CVX': { Component: MaterialCommunityIcons, name: 'oil', type: 'material' },
      'COP': { Component: MaterialCommunityIcons, name: 'oil-lamp', type: 'material' },
      'SLB': { Component: MaterialCommunityIcons, name: 'pipe', type: 'material' },
      'EOG': { Component: MaterialCommunityIcons, name: 'barrel', type: 'material' },
      
      // Auto
      'F': { Component: MaterialCommunityIcons, name: 'car', type: 'material' },
      'GM': { Component: MaterialCommunityIcons, name: 'car-side', type: 'material' },
      'TM': { Component: MaterialCommunityIcons, name: 'car-estate', type: 'material' },
      'HMC': { Component: MaterialCommunityIcons, name: 'car-hatchback', type: 'material' },
      
      // Travel & Airlines
      'UAL': { Component: MaterialCommunityIcons, name: 'airplane', type: 'material' },
      'DAL': { Component: MaterialCommunityIcons, name: 'airplane-takeoff', type: 'material' },
      'AAL': { Component: MaterialCommunityIcons, name: 'airplane-landing', type: 'material' },
      'LUV': { Component: FontAwesome5, name: 'plane-departure', type: 'solid' },
      'BA': { Component: MaterialCommunityIcons, name: 'rocket', type: 'material' },
      
      // Industrial
      'CAT': { Component: MaterialCommunityIcons, name: 'truck', type: 'material' },
      'DE': { Component: MaterialCommunityIcons, name: 'tractor', type: 'material' },
      'MMM': { Component: MaterialCommunityIcons, name: 'hammer-wrench', type: 'material' },
      'HON': { Component: MaterialCommunityIcons, name: 'factory', type: 'material' },
      'UPS': { Component: MaterialCommunityIcons, name: 'truck-delivery', type: 'material' },
      'FDX': { Component: MaterialCommunityIcons, name: 'truck-fast', type: 'material' },
      
      // Utilities
      'NEE': { Component: MaterialCommunityIcons, name: 'lightbulb', type: 'material' },
      'SO': { Component: MaterialCommunityIcons, name: 'lightbulb-on', type: 'material' },
      'DUK': { Component: MaterialCommunityIcons, name: 'transmission-tower', type: 'material' },
      'D': { Component: MaterialCommunityIcons, name: 'power-plug', type: 'material' },
      'AEP': { Component: MaterialCommunityIcons, name: 'flash', type: 'material' },
      
      // Real Estate
      'SPG': { Component: MaterialCommunityIcons, name: 'office-building', type: 'material' },
      'AMT': { Component: MaterialCommunityIcons, name: 'antenna', type: 'material' },
      'PLD': { Component: MaterialCommunityIcons, name: 'warehouse', type: 'material' },
      'CCI': { Component: MaterialCommunityIcons, name: 'broadcast-tower', type: 'material' },
      'EQIX': { Component: MaterialCommunityIcons, name: 'server', type: 'material' },
      
      // Telecom
      'T': { Component: MaterialCommunityIcons, name: 'phone', type: 'material' },
      'VZ': { Component: MaterialCommunityIcons, name: 'cellphone', type: 'material' },
      'TMUS': { Component: MaterialCommunityIcons, name: 'cellphone-wireless', type: 'material' },
      
      // Food & Beverage
      'MDLZ': { Component: MaterialCommunityIcons, name: 'cookie', type: 'material' },
      'GIS': { Component: MaterialCommunityIcons, name: 'bowl-mix', type: 'material' },
      'K': { Component: MaterialCommunityIcons, name: 'corn', type: 'material' },
      'HSY': { Component: MaterialCommunityIcons, name: 'candy', type: 'material' },
      'TSN': { Component: MaterialCommunityIcons, name: 'food-drumstick', type: 'material' },
    };
    
    // Return specific icon if available
    if (iconMap[symbol]) {
      return iconMap[symbol];
    }
    
    // Default to a generic icon based on first letter
    const firstChar = symbol.charAt(0).toLowerCase();
    
    if (['a', 'b', 'c'].includes(firstChar)) return { Component: MaterialCommunityIcons, name: 'office-building', type: 'material' };
    if (['d', 'e', 'f'].includes(firstChar)) return { Component: MaterialIcons, name: 'attach-money', type: 'material' };
    if (['g', 'h', 'i'].includes(firstChar)) return { Component: MaterialCommunityIcons, name: 'earth', type: 'material' };
    if (['j', 'k', 'l'].includes(firstChar)) return { Component: MaterialCommunityIcons, name: 'bank', type: 'material' };
    if (['m', 'n', 'o'].includes(firstChar)) return { Component: MaterialIcons, name: 'shopping-cart', type: 'material' };
    if (['p', 'q', 'r'].includes(firstChar)) return { Component: MaterialCommunityIcons, name: 'pill', type: 'material' };
    if (['s', 't', 'u'].includes(firstChar)) return { Component: MaterialIcons, name: 'trending-up', type: 'material' };
    if (['v', 'w', 'x', 'y', 'z'].includes(firstChar)) return { Component: MaterialCommunityIcons, name: 'lightning-bolt', type: 'material' };
    
    // Default fallback
    return { Component: MaterialIcons, name: 'trending-up', type: 'material' };
  };