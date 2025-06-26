// src/utils/Portfolio.ts
import { Stock } from "@/types";
import { StorageUtils } from '@/store/AsyncStorage';

const defaultPortfolio: Stock[] = [
  { symbol: 'TSLA', quantity: 1, name: 'Tesla' },
  { symbol: 'AMZN', quantity: 2, name: 'Amazon' },
  { symbol: 'AAPL', quantity: 3, name: 'Apple' },
  { symbol: 'NVDA', quantity: 4, name: 'NVIDIA' }
];

export const portfolioData: Stock[] = [...defaultPortfolio];

StorageUtils.get<Stock[]>('portfolio_data', defaultPortfolio)
  .then(storedPortfolio => {
    if (Array.isArray(storedPortfolio)) {
      portfolioData.length = 0;
      portfolioData.push(...storedPortfolio);
    } else {
      StorageUtils.set('portfolio_data', defaultPortfolio);
    }
  })
  .catch(error => {
    console.error('Error loading portfolio data:', error);
  });

export const updatePortfolioData = async (newPortfolio: Stock[]) => {
  await StorageUtils.set('portfolio_data', newPortfolio);
  portfolioData.length = 0;
  portfolioData.push(...newPortfolio);
};