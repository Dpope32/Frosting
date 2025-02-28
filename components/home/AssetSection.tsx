// Fix for AssetSection.tsx
import React, { useState } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { usePortfolioStore, usePortfolioQuery, removeFromWatchlist } from '@/store/PortfolioStore';
import { portfolioData } from '@/utils/Portfolio';
import { getValueColor } from '@/constants/valueHelper';

// Define types for the data returned from usePortfolioQuery
interface StockData {
  prices: Record<string, number>;
  changes: Record<string, number>;
  changePercents: Record<string, number>;
  historicalData: Record<string, {
    '1m': number | null;
    '6m': number | null;
    '1y': number | null;
  }>;
}

export function AssetSection({ onAddToWatchlist }: { onAddToWatchlist: () => void }) {
  const { watchlist } = usePortfolioStore();
  const { data, isLoading } = usePortfolioQuery();
  const stockData = data as StockData | undefined;
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('portfolio');

  // Calculate returns for each stock
  const calculateReturns = (symbol: string) => {
    if (__DEV__) console.log(`[AssetSection] Calculating returns for ${symbol}`);
    
    if (!stockData) {
      if (__DEV__) console.log(`[AssetSection] No stockData available`);
      return null;
    }
    
    if (!stockData.historicalData) {
      if (__DEV__) console.log(`[AssetSection] No historicalData available in stockData`);
      return null;
    }
    
    if (!stockData.prices) {
      if (__DEV__) console.log(`[AssetSection] No prices available in stockData`);
      return null;
    }
    
    const current = stockData.prices[symbol] || 0;
    if (__DEV__) console.log(`[AssetSection] Current price for ${symbol}: ${current}`);
    
    const historical = stockData.historicalData[symbol] || { '1m': null, '6m': null, '1y': null };
    if (__DEV__) console.log(`[AssetSection] Historical data for ${symbol}:`, historical);
    
    // Calculate purchase price (for all-time returns)
    const stock = portfolioData.find(s => s.symbol === symbol);
    
    // FIXED: Only use a fallback if there's no actual purchase price
    // Instead of using 80% of current price, use a more flexible approach
    // You could add historical data from 1 year ago as a fallback (if available)
    const purchasePrice = stock?.purchasePrice || historical['1y'] || 0;
    
    // If we don't have a valid purchase price, indicate this with null
    const allTimeReturn = purchasePrice > 0 
      ? ((current - purchasePrice) / purchasePrice) * 100 
      : null;
    
    const oneMonthReturn = historical['1m'] && historical['1m'] > 0 
      ? ((current - historical['1m']) / historical['1m']) * 100 
      : null;
      
    const sixMonthReturn = historical['6m'] && historical['6m'] > 0 
      ? ((current - historical['6m']) / historical['6m']) * 100 
      : null;
      
    const oneYearReturn = historical['1y'] && historical['1y'] > 0 
      ? ((current - historical['1y']) / historical['1y']) * 100 
      : null;
    
    if (__DEV__) console.log(`[AssetSection] Calculated returns for ${symbol}:`, {
      '1m': oneMonthReturn,
      '6m': sixMonthReturn,
      '1y': oneYearReturn,
      'allTime': allTimeReturn
    });
    
    return {
      '1m': oneMonthReturn,
      '6m': sixMonthReturn,
      '1y': oneYearReturn,
      'allTime': allTimeReturn
    };
  };

  const handleRemoveFromWatchlist = async (symbol: string) => {
    await removeFromWatchlist(symbol);
  };
  
  // Render table for portfolio or watchlist
  const renderTable = () => {
    const stocks = activeTab === 'portfolio' 
      ? portfolioData 
      : watchlist.map(symbol => ({ symbol, name: symbol, quantity: 0 }));
    
    if (stocks.length === 0) {
      return (
        <YStack 
          height={100} 
          alignItems="center" 
          justifyContent="center"
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          marginTop="$4"
        >
          <Text color={isDark ? "#999" : "#666"} fontSize={14}>
            {activeTab === 'portfolio' ? 'No stocks in portfolio' : 'No stocks in watchlist'}
          </Text>
          <Text color={isDark ? "#666" : "#999"} fontSize={14}>
            {activeTab === 'portfolio' ? 'Edit your portfolio to add stocks' : 'Tap + to add stocks to your watchlist'}
          </Text>
        </YStack>
      );
    }

    return (
      <YStack>
        {/* Table header */}
        <XStack 
          borderBottomWidth={1} 
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
          paddingVertical="$2"
          paddingHorizontal="$2"
        >
          <Text width="15%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Symbol</Text>
          <Text width="15%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Price</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Today</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1M</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">6M</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1Y</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">All Time</Text>
        </XStack>
        
        {/* Table rows */}
        {stocks.map(stock => {
          const currentPrice = stockData?.prices?.[stock.symbol] || 0;
          // FIXED: Access the changePercent directly from the API data
          const changePercent = stockData?.changePercents?.[stock.symbol] || 0;
          
          if (__DEV__) console.log(`[AssetSection] Processing stock ${stock.symbol}, price: ${currentPrice}, changePercent: ${changePercent}`);
          const returns = calculateReturns(stock.symbol);
          
          return (
            <XStack 
              key={stock.symbol} 
              borderBottomWidth={1} 
              borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 
              paddingVertical="$3"
              paddingHorizontal="$2"
              alignItems="center"
            >
              <XStack width="15%" alignItems="center" gap="$2">
                <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500" fontFamily="$body">{stock.symbol}</Text>
                {activeTab === 'watchlist' && (
                  <Pressable
                    onPress={() => handleRemoveFromWatchlist(stock.symbol)}
                    style={({ pressed }) => ({
                      opacity: pressed ? 0.7 : 1,
                    })}
                  >
                    <MaterialIcons 
                      name="close" 
                      size={16} 
                      color={isDark ? "#999" : "#666"} 
                    />
                  </Pressable>
                )}
              </XStack>
              <Text width="15%" color={isDark ? "#fff" : "#000"} fontSize={14} fontFamily="$body">
                ${currentPrice.toFixed(2)}
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', changePercent, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {changePercent > 0 ? '+' : ''}{changePercent.toFixed(2)}%
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', returns && returns['1m'] ? returns['1m'] : 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns && returns['1m'] !== null 
                  ? `${returns['1m'] > 0 ? '+' : ''}${returns['1m'].toFixed(2)}%` 
                  : 'N/A'}
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', returns && returns['6m'] ? returns['6m'] : 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns && returns['6m'] !== null 
                  ? `${returns['6m'] > 0 ? '+' : ''}${returns['6m'].toFixed(2)}%` 
                  : 'N/A'}
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', returns && returns['1y'] ? returns['1y'] : 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns && returns['1y'] !== null 
                  ? `${returns['1y'] > 0 ? '+' : ''}${returns['1y'].toFixed(2)}%` 
                  : 'N/A'}
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', returns && returns['allTime'] ? returns['allTime'] : 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns && returns['allTime'] !== null 
                  ? `${returns['allTime'] > 0 ? '+' : ''}${returns['allTime'].toFixed(2)}%` 
                  : 'N/A'}
              </Text>
            </XStack>
          );
        })}
      </YStack>
    );
  };
  
  return (
    <YStack>
      <XStack marginBottom="$3" alignItems="center">
        <Button
          backgroundColor={activeTab === 'portfolio' ? 'rgba(219, 208, 198, 0.2)' : 'transparent'}
          borderRadius={8}
          paddingHorizontal="$3"
          paddingVertical="$1"
          onPress={() => setActiveTab('portfolio')}
        >
          <Text color="#dbd0c6" fontSize={14} fontFamily="$body">Portfolio</Text>
        </Button>
        <XStack alignItems="center">
          <Button
            backgroundColor={activeTab === 'watchlist' ? 'rgba(219, 208, 198, 0.2)' : 'transparent'}
            borderRadius={8}
            paddingHorizontal="$3"
            paddingVertical="$1"
            onPress={() => setActiveTab('watchlist')}
          >
            <Text color="#dbd0c6" fontSize={14} fontFamily="$body">Watchlist</Text>
          </Button>
          {activeTab === 'watchlist' && (
            <Pressable
              onPress={onAddToWatchlist}
              style={({ pressed }) => ({
                opacity: pressed ? 0.7 : 1,
                marginLeft: 8,
              })}
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color="#dbd0c6"
              />
            </Pressable>
          )}
        </XStack>
      </XStack>
      
      {isLoading ? (
        <YStack 
          height={100} 
          alignItems="center" 
          justifyContent="center"
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          marginTop="$4"
        >
          <Text color={isDark ? "#999" : "#666"} fontSize={14} fontFamily="$body">
            Loading asset data...
          </Text>
        </YStack>
      ) : renderTable()}
    </YStack>
  );
}