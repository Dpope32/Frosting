// src/utils/Portfolio.ts
import { Stock } from "@/types";

import { storage } from '../store/MMKV';

const defaultPortfolio: Stock[] = [
  { symbol: 'TSLA', quantity: 1, name: 'Tesla' },
  { symbol: 'AMZN', quantity: 1, name: 'Amazon' },
  { symbol: 'AAPL', quantity: 1, name: 'Apple' },
  { symbol: 'NVDA', quantity: 1, name: 'NVIDIA' }
];

// Initialize portfolio data from storage or use default
const storedPortfolio = storage.getString('portfolio_data');
export const portfolioData: Stock[] = storedPortfolio 
  ? JSON.parse(storedPortfolio) 
  : defaultPortfolio;

// Save initial portfolio if none exists
if (!storedPortfolio) {
  storage.set('portfolio_data', JSON.stringify(defaultPortfolio));
}

export const updatePortfolioData = (newPortfolio: Stock[]) => {
  storage.set('portfolio_data', JSON.stringify(newPortfolio));
  // Update the reference to maintain reactivity
  portfolioData.length = 0;
  portfolioData.push(...newPortfolio);
};
