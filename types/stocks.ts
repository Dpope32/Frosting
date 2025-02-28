export interface PortfolioQueryData {
    prices: Record<string, number>;
    previousClose: Record<string, number>;
    changes: Record<string, number>;
    changePercents: Record<string, number>;
    fiftyTwoWeekHigh: Record<string, number>;
    fiftyTwoWeekLow: Record<string, number>;
    historicalData: Record<string, {
      '1m': number | null;
      '6m': number | null;
      '1y': number | null;
      'earliest': number | null;
    }>;
  }