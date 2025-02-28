import React, { useState } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { usePortfolioStore, usePortfolioQuery, removeFromWatchlist } from '@/store/PortfolioStore';
import { portfolioData } from '@/utils/Portfolio';
import { getValueColor } from '@/constants/valueHelper';
import { PortfolioQueryData } from '@/types/stocks';

export function AssetSection({ onAddToWatchlist }: { onAddToWatchlist: () => void }) {
  // Force a refetch by using a unique query key
  const { data, isLoading, refetch } = usePortfolioQuery();
  const stockData = data as PortfolioQueryData | undefined;
  const { watchlist } = usePortfolioStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState('portfolio');
  
  // Force a refetch when the component mounts
  React.useEffect(() => {
    // Add a small delay to ensure the component is fully mounted
    const timer = setTimeout(() => {
      refetch();
    }, 500);
    
    return () => clearTimeout(timer);
  }, [refetch]);

  // Calculate buy indicator score (0-100%)
  const calculateBuyIndicator = (symbol: string) => {
    if (!stockData) return null;
    
    const currentPrice = stockData.prices[symbol] || 0;
    const fiftyTwoWeekHigh = stockData.fiftyTwoWeekHigh?.[symbol] || 0;
    const fiftyTwoWeekLow = stockData.fiftyTwoWeekLow?.[symbol] || 0;
    
    if (fiftyTwoWeekHigh <= fiftyTwoWeekLow || currentPrice <= 0) return null;
    
    // Calculate position within 52-week range (0% = at 52-week low, 100% = at 52-week high)
    const range = fiftyTwoWeekHigh - fiftyTwoWeekLow;
    const positionInRange = currentPrice - fiftyTwoWeekLow;
    const percentOfRange = (positionInRange / range) * 100;
    
    // Invert the score (lower is better buy opportunity)
    const buyScore = 100 - percentOfRange;
    
    return buyScore;
  };

  // Calculate returns for each stock directly from API data
  const calculateReturns = (symbol: string) => {
    if (!stockData || !stockData.prices || !stockData.historicalData) return null;
    
    const currentPrice = stockData.prices[symbol] || 0;
    if (currentPrice <= 0) return null;
    
    const historical = stockData.historicalData[symbol] || { 
      '1m': null, 
      '6m': null, 
      '1y': null,
      'earliest': null 
    };
    
    // Calculate returns using the historical data
    // For 1-month return, use the historical 1-month price
    const oneMonthReturn = historical['1m'] && historical['1m'] > 0 
      ? ((currentPrice - historical['1m']) / historical['1m']) * 100 
      : null;
      
    const sixMonthReturn = historical['6m'] && historical['6m'] > 0 
      ? ((currentPrice - historical['6m']) / historical['6m']) * 100 
      : null;
      
    const oneYearReturn = historical['1y'] && historical['1y'] > 0 
      ? ((currentPrice - historical['1y']) / historical['1y']) * 100 
      : null;
    
    // For all-time return, use the earliest data point if available or fallback to purchase price
    const stock = portfolioData.find(s => s.symbol === symbol);
    const purchasePrice = stock?.purchasePrice || 0;
    
    // Use the earliest historical price if available (fetched from max range)
    const earliestPrice = historical['earliest'];
    
    // Calculate all-time return based on what data is available
    let allTimeReturn = null;
    
    if (earliestPrice && earliestPrice > 0) {
      // Use earliest historical price (most accurate)
      allTimeReturn = ((currentPrice - earliestPrice) / earliestPrice) * 100;
    } else if (purchasePrice > 0) {
      // Fallback to purchase price if available
      allTimeReturn = ((currentPrice - purchasePrice) / purchasePrice) * 100;
    }
    
    // Log the calculation for debugging
    if (__DEV__) {
      console.log(`[AssetSection] ${symbol} returns:`, {
        currentPrice,
        oneMonthPrice: historical['1m'],
        oneMonthReturn,
        earliestPrice,
        allTimeReturn
      });
    }
    
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
          <Text width="12%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Symbol</Text>
          <Text width="13%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Price</Text>
          <Text width="12%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Today</Text>
          <Text width="12%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1M</Text>
          <Text width="12%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">6M</Text>
          <Text width="12%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1Y</Text>
          <Text width="14%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">All Time</Text>
          <Text width="13%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Buy Score</Text>
        </XStack>
        
        {/* Table rows */}
        {stocks.map(stock => {
          if (!stockData) return null;
          
          const symbol = stock.symbol;
          const currentPrice = stockData.prices?.[symbol] || 0;
          
          // Get today's change directly from the API data
          const todayChangePercent = stockData.changePercents?.[symbol] || 0;
          
          const returns = calculateReturns(symbol);
          const buyScore = calculateBuyIndicator(symbol);
          
          // Function to render a return value with proper formatting
          const renderReturn = (value: number | null) => {
            if (value === null || isNaN(value)) return 'N/A';
            const prefix = value > 0 ? '+' : '';
            return `${prefix}${value.toFixed(2)}%`;
          };
          
          // Get color for the buy indicator
          const getBuyScoreColor = (score: number | null) => {
            if (score === null) return isDark ? "#999" : "#666";
            if (score >= 66) return "#4caf50"; // Good buy (green)
            if (score >= 33) return "#ff9800"; // Neutral (orange)
            return "#f44336"; // Poor buy (red)
          };
          
          return (
            <XStack 
              key={symbol} 
              borderBottomWidth={1} 
              borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 
              paddingVertical="$3"
              paddingHorizontal="$2"
              alignItems="center"
            >
              <XStack width="12%" alignItems="center" gap="$2">
                <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500" fontFamily="$body">{symbol}</Text>
                {activeTab === 'watchlist' && (
                  <Pressable
                    onPress={() => handleRemoveFromWatchlist(symbol)}
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
              <Text width="13%" color={isDark ? "#fff" : "#000"} fontSize={14} fontFamily="$body">
                ${currentPrice.toFixed(2)}
              </Text>
              <Text 
                width="12%" 
                color={getValueColor('portfolio', todayChangePercent, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {renderReturn(todayChangePercent)}
              </Text>
              <Text 
                width="12%" 
                color={getValueColor('portfolio', returns?.['1m'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['1m']) : 'N/A'}
              </Text>
              <Text 
                width="12%" 
                color={getValueColor('portfolio', returns?.['6m'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['6m']) : 'N/A'}
              </Text>
              <Text 
                width="12%" 
                color={getValueColor('portfolio', returns?.['1y'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['1y']) : 'N/A'}
              </Text>
              <Text 
                width="14%" 
                color={getValueColor('portfolio', returns?.['allTime'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['allTime']) : 'N/A'}
              </Text>
              <XStack 
                width="13%" 
                alignItems="center" 
                justifyContent="flex-start"
              >
                {buyScore !== null ? (
                  <>
                    <Text 
                      color={getBuyScoreColor(buyScore)} 
                      fontSize={14}
                      fontFamily="$body"
                      marginRight="$1"
                    >
                      {Math.round(buyScore)}
                    </Text>
                    <YStack
                      width={30}
                      height={8}
                      backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                      borderRadius={4}
                      overflow="hidden"
                    >
                      <YStack
                        height="100%"
                        width={`${Math.min(100, Math.max(0, buyScore))}%`}
                        backgroundColor={getBuyScoreColor(buyScore)}
                      />
                    </YStack>
                  </>
                ) : (
                  <Text color={isDark ? "#999" : "#666"} fontSize={14} fontFamily="$body">
                    N/A
                  </Text>
                )}
              </XStack>
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
