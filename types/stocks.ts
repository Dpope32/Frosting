export interface Stock {
  symbol: string;
  quantity: number;
  name: string;
  purchasePrice?: number; 
}

export interface PortfolioQueryData {
    prices: Record<string, number>;
    previousClose: Record<string, number>;
    changes: Record<string, number>;
    changePercents: Record<string, number>;
    fiftyTwoWeekHigh: Record<string, number>;
    fiftyTwoWeekLow: Record<string, number>;
    historicalData: Record<string, {
      '1w': number | null;
      '1m': number | null;
      '3m': number | null;
      '6m': number | null;
      '1y': number | null;
      'ytd': number | null;
      'earliest': number | null;
    }>;
  }
