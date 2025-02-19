// src/utils/Portfolio.ts
import { Stock } from "@/types";

import { StorageUtils } from '../store/MMKV';

const defaultPortfolio: Stock[] = [
  { symbol: 'TSLA', quantity: 1, name: 'Tesla' },
  { symbol: 'AMZN', quantity: 1, name: 'Amazon' },
  { symbol: 'AAPL', quantity: 1, name: 'Apple' },
  { symbol: 'NVDA', quantity: 1, name: 'NVIDIA' }
];

// Initialize portfolio data from storage or use default
export const portfolioData: Stock[] = StorageUtils.get<Stock[]>('portfolio_data', defaultPortfolio) ?? defaultPortfolio;

// Save initial portfolio if it doesn't exist
if (!StorageUtils.get('portfolio_data')) {
  StorageUtils.set('portfolio_data', defaultPortfolio);
}

export const updatePortfolioData = (newPortfolio: Stock[]) => {
  StorageUtils.set('portfolio_data', newPortfolio);
  // Update the reference to maintain reactivity
  portfolioData.length = 0;
  portfolioData.push(...newPortfolio);
};
