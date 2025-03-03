import React, { useState } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Tooltip  } from 'tamagui';
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
    
    // Get historical returns
    const returns = calculateReturns(symbol);
    if (!returns) return null;
    
    // Calculate position within 52-week range (0% = at 52-week low, 100% = at 52-week high)
    const range = fiftyTwoWeekHigh - fiftyTwoWeekLow;
    const positionInRange = currentPrice - fiftyTwoWeekLow;
    const percentOfRange = (positionInRange / range) * 100;
    
    // Invert the score (lower is better buy opportunity)
    const fiftyTwoWeekScore = 100 - percentOfRange;
    
    // Factor in recent performance trends
    // If recent returns are negative, it could be a buying opportunity 
    // If they're strongly positive, it might be overbought
    const weekReturn = returns['1w'] ?? 0;
    const monthReturn = returns['1m'] ?? 0;
    const threeMonthReturn = returns['3m'] ?? 0;
    const ytdReturn = returns['ytd'] ?? 0;
    
    // Score recent trends (Negative returns increase buy score, positive returns decrease it)
    // Weighted to give more importance to more recent time periods
    const trendScore = (
      (weekReturn < 0 ? 25 - weekReturn : 25 - weekReturn * 1.5) * 0.4 + // Week has 40% weight
      (monthReturn < 0 ? 25 - monthReturn : 25 - monthReturn * 1.2) * 0.3 + // Month has 30% weight
      (threeMonthReturn < 0 ? 25 - threeMonthReturn * 0.8 : 25 - threeMonthReturn) * 0.2 + // 3 Month has 20% weight
      (ytdReturn < 0 ? 25 - ytdReturn * 0.5 : 25 - ytdReturn * 0.8) * 0.1 // YTD has 10% weight
    );
    
    // Calculate momentum factor (momentum shifting from negative to positive is good)
    // This checks if the stock is starting to recover after a downtrend
    const momentumFactor = 
      weekReturn > monthReturn && monthReturn < 0 ? 10 : // Starting to recover from monthly decline
      weekReturn > 0 && monthReturn < 0 ? 15 : // Weekly positive after monthly decline
      weekReturn > 0 && monthReturn > 0 && threeMonthReturn < 0 ? 8 : // Recovering from 3-month decline
      weekReturn < -10 && monthReturn < -15 ? -5 : // Sharp recent decline, might continue
      0; // Neutral momentum
    
    // Combine scores with weights
    // 50% weight to 52-week range position
    // 40% weight to recent performance trends
    // 10% for momentum shifts
    const combinedScore = 
      (fiftyTwoWeekScore * 0.5) + 
      (trendScore * 0.4) + 
      momentumFactor;
    
    // Clamp final score between 0-100
    return Math.min(100, Math.max(0, combinedScore));
  };

  // Calculate returns for each stock directly from API data
  const calculateReturns = (symbol: string) => {
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
    
    // Calculate returns using the historical data
    const oneWeekReturn = historical['1w'] && historical['1w'] > 0 
      ? ((currentPrice - historical['1w']) / historical['1w']) * 100 
      : null;
      
    const oneMonthReturn = historical['1m'] && historical['1m'] > 0 
      ? ((currentPrice - historical['1m']) / historical['1m']) * 100 
      : null;
      
    const threeMonthReturn = historical['3m'] && historical['3m'] > 0 
      ? ((currentPrice - historical['3m']) / historical['3m']) * 100 
      : null;
      
    const sixMonthReturn = historical['6m'] && historical['6m'] > 0 
      ? ((currentPrice - historical['6m']) / historical['6m']) * 100 
      : null;
      
    const oneYearReturn = historical['1y'] && historical['1y'] > 0 
      ? ((currentPrice - historical['1y']) / historical['1y']) * 100 
      : null;
      
    const ytdReturn = historical['ytd'] && historical['ytd'] > 0 
      ? ((currentPrice - historical['ytd']) / historical['ytd']) * 100 
      : null;
    
    // For all-time return, prioritize the split-adjusted IPO price (set as purchasePrice)
    // and fall back to the earliest historical price if purchasePrice is not available
    const stock = portfolioData.find(s => s.symbol === symbol);
    const purchasePrice = stock?.purchasePrice || 0;
    
    // Use the earliest historical price if available (fetched from max range)
    const earliestPrice = historical['earliest'];
    
    return {
      '1w': oneWeekReturn,
      '1m': oneMonthReturn,
      '3m': threeMonthReturn,
      '6m': sixMonthReturn,
      '1y': oneYearReturn,
      'ytd': ytdReturn,
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
          <Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={14}>
            {activeTab === 'portfolio' ? 'No stocks in portfolio' : 'No stocks in watchlist'}
          </Text>
          <Text color={isDark ? "#666" : "#999"} fontFamily="$body" fontSize={14}>
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
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Symbol</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Price</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Today</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">YTD</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1W</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1M</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">3M</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">6M</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1Y</Text>
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Buy</Text>
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
            
            // Color gradient from red (poor) to green (excellent)
            if (score >= 80) return "#00c853"; // Excellent buy (bright green)
            if (score >= 65) return "#4caf50"; // Very good buy (standard green)
            if (score >= 50) return "#8bc34a"; // Good buy (light green)
            if (score >= 40) return "#cddc39"; // Fair buy (lime)
            if (score >= 30) return "#ffc107"; // Neutral (amber)
            if (score >= 20) return "#ff9800"; // Below average (orange)
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
              <XStack width="10%" alignItems="center" gap="$1">
                <Text color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontWeight="500" fontFamily="$body">{symbol}</Text>
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
              <Text width="10%" color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontFamily="$body">
                <Text color={isDark ? "#4caf50" : "#2e7d32"} fontSize={14} fontFamily="$body">$</Text>{currentPrice.toFixed(2)}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', todayChangePercent, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {renderReturn(todayChangePercent)}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['ytd'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['ytd']) : 'N/A'}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['1w'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['1w']) : 'N/A'}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['1m'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['1m']) : 'N/A'}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['3m'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['3m']) : 'N/A'}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['6m'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['6m']) : 'N/A'}
              </Text>
              <Text 
                width="10%" 
                color={getValueColor('portfolio', returns?.['1y'] || 0, '')} 
                fontSize={14}
                fontFamily="$body"
              >
                {returns ? renderReturn(returns['1y']) : 'N/A'}
              </Text>

              <XStack 
                width="10%" 
                alignItems="center" 
                justifyContent="flex-start"
              >
                {buyScore !== null ? (
                  <Tooltip placement="top" delay={300}>
                    <Tooltip.Trigger>
                      <XStack alignItems="center">
                        <Text 
                          color={getBuyScoreColor(buyScore)} 
                          fontSize={14}
                          fontWeight="600"
                          fontFamily="$body"
                          marginRight="$2"
                        >
                          {Math.round(buyScore)}
                        </Text>
                        <YStack
                          width={40}
                          height={10}
                          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                          borderRadius={6}
                          overflow="hidden"
                        >
                          <YStack
                            height="100%"
                            width={`${Math.min(100, Math.max(0, buyScore))}%`}
                            backgroundColor={getBuyScoreColor(buyScore)}
                          />
                        </YStack>
                      </XStack>
                    </Tooltip.Trigger>
                    <Tooltip.Content>
                        <YStack 
  padding="$4" 
  width={300} 
  backgroundColor="rgba(30, 30, 30, 0.95)" 
  borderRadius={12} 
  borderWidth={1} 
  borderColor="rgba(255, 255, 255, 0.15)"
>
  <Text 
    fontSize={16} 
    fontWeight="600" 
    fontFamily="$body" 
    color={getBuyScoreColor(buyScore)}
    marginBottom="$2"
  >
    Buy Score: {Math.round(buyScore)}/100
  </Text>
  
  <YStack width="100%" paddingRight={16}>
    <Text 
      fontSize={13} 
      fontFamily="$body" 
      color="#dbd0c6"
      marginBottom="$3"
      fontWeight="500"
    >
      Based on 52-week range, recent trends, and price momentum:
    </Text>
    
  <YStack width="100%" gap="$3" marginBottom="$3">
    <XStack width="100%" gap="$2" alignItems="flex-start">
      <YStack 
        width={8} 
        height={8} 
        backgroundColor="rgba(219, 208, 198, 0.5)" 
        borderRadius={4}
        marginTop="$1"
        marginLeft="$1"
      />
      <YStack width="85%" paddingRight={16}>
        <Text 
          fontSize={12} 
          fontFamily="$body" 
          color="#dbd0c6"
        >
          Current price position relative to 52-week High/Low (50%)
        </Text>
      </YStack>
    </XStack>
    
    <XStack width="100%" gap="$2" alignItems="flex-start">
      <YStack 
        width={8} 
        height={8} 
        backgroundColor="rgba(219, 208, 198, 0.5)" 
        borderRadius={4}
        marginTop="$1"
        marginLeft="$1"
      />
      <YStack width="85%" paddingRight={16}>
        <Text 
          fontSize={12} 
          fontFamily="$body" 
          color="#dbd0c6"
        >
          Recent performance across multiple timeframes (40%)
        </Text>
      </YStack>
    </XStack>
    
    <XStack width="100%" gap="$2" alignItems="flex-start">
      <YStack 
        width={8} 
        height={8} 
        backgroundColor="rgba(219, 208, 198, 0.5)" 
        borderRadius={4}
        marginTop="$1"
        marginLeft="$1"
      />
      <YStack width="85%" paddingRight={16}>
        <Text 
          fontSize={12} 
          fontFamily="$body" 
          color="#dbd0c6"
        >
          Momentum shifts that indicate potential reversals (10%)
        </Text>
      </YStack>
    </XStack>
  </YStack>
  
  <YStack width="100%" paddingHorizontal={12}>
    <Text 
      fontSize={13} 
      fontFamily="$body" 
      fontWeight="500" 
      color="#dbd0c6"
      textAlign="center"
    >
      Higher scores suggest better buying opportunities.
    </Text>
  </YStack>
</YStack>
                      </YStack>
                    </Tooltip.Content>
                  </Tooltip>
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
