// portfolioService.ts
import { PortfolioQueryData } from '@/types/stocks';

// Portfolio calculations that don't use hooks
export const calculateBuyIndicator = (
  symbol: string, 
  stockData: PortfolioQueryData | undefined,
  calculateReturnsFunc: (symbol: string, stockData: PortfolioQueryData | undefined) => ReturnType | null
) => {
  if (!stockData) return null;
  const currentPrice = stockData.prices[symbol] || 0;
  const fiftyTwoWeekHigh = stockData.fiftyTwoWeekHigh?.[symbol] || 0;
  const fiftyTwoWeekLow = stockData.fiftyTwoWeekLow?.[symbol] || 0;
  
  if (fiftyTwoWeekHigh <= fiftyTwoWeekLow || currentPrice <= 0) return null;
  
  const returns = calculateReturnsFunc(symbol, stockData);
  if (!returns) return null;
  
  const range = fiftyTwoWeekHigh - fiftyTwoWeekLow;
  const positionInRange = currentPrice - fiftyTwoWeekLow;
  const percentOfRange = (positionInRange / range) * 100;
  const fiftyTwoWeekScore = 100 - percentOfRange;
  
  const weekReturn = returns['1w'] ?? 0;
  const monthReturn = returns['1m'] ?? 0;
  const threeMonthReturn = returns['3m'] ?? 0;
  const ytdReturn = returns['ytd'] ?? 0;
  
  const trendScore = (
    (weekReturn < 0 ? 25 - weekReturn : 25 - weekReturn * 1.5) * 0.4 +
    (monthReturn < 0 ? 25 - monthReturn : 25 - monthReturn * 1.2) * 0.3 +
    (threeMonthReturn < 0 ? 25 - threeMonthReturn * 0.8 : 25 - threeMonthReturn) * 0.2 +
    (ytdReturn < 0 ? 25 - ytdReturn * 0.5 : 25 - ytdReturn * 0.8) * 0.1
  );
  
  const momentumFactor =
    weekReturn > monthReturn && monthReturn < 0 ? 10 :
    weekReturn > 0 && monthReturn < 0 ? 15 :
    weekReturn > 0 && monthReturn > 0 && threeMonthReturn < 0 ? 8 :
    weekReturn < -10 && monthReturn < -15 ? -5 :
    0;
  
  const combinedScore = (fiftyTwoWeekScore * 0.5) + (trendScore * 0.4) + momentumFactor;
  return Math.min(100, Math.max(0, combinedScore));
};

export type ReturnType = {
  '1w': number | null;
  '1m': number | null;
  '3m': number | null;
  '6m': number | null;
  '1y': number | null;
  'ytd': number | null;
};

export const calculateReturns = (
  symbol: string, 
  stockData: PortfolioQueryData | undefined
): ReturnType | null => {
  if (!stockData || !stockData.prices || !stockData.historicalData) return null;
  
  const currentPrice = stockData.prices[symbol] || 0;
  if (currentPrice <= 0) return null;
  
  const historical = stockData.historicalData[symbol] || {
    '1w': null,
    '1m': null,
    '3m': null,
    '6m': null,
    '1y': null,
    'ytd': null,
    'earliest': null
  };
  
  const oneWeekReturn = historical['1w'] && historical['1w'] > 0 ? 
    ((currentPrice - historical['1w']) / historical['1w']) * 100 : null;
  
  const oneMonthReturn = historical['1m'] && historical['1m'] > 0 ? 
    ((currentPrice - historical['1m']) / historical['1m']) * 100 : null;
  
  const threeMonthReturn = historical['3m'] && historical['3m'] > 0 ? 
    ((currentPrice - historical['3m']) / historical['3m']) * 100 : null;
  
  const sixMonthReturn = historical['6m'] && historical['6m'] > 0 ? 
    ((currentPrice - historical['6m']) / historical['6m']) * 100 : null;
  
  const oneYearReturn = historical['1y'] && historical['1y'] > 0 ? 
    ((currentPrice - historical['1y']) / historical['1y']) * 100 : null;
  
  const ytdReturn = historical['ytd'] && historical['ytd'] > 0 ? 
    ((currentPrice - historical['ytd']) / historical['ytd']) * 100 : null;
  
  return {
    '1w': oneWeekReturn,
    '1m': oneMonthReturn,
    '3m': threeMonthReturn,
    '6m': sixMonthReturn,
    '1y': oneYearReturn,
    'ytd': ytdReturn,
  };
};
