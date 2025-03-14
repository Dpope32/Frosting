// components/PortfolioTable.tsx
import React from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Tooltip } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { getValueColor } from '@/constants/valueHelper';
import { PortfolioQueryData } from '@/types/stocks';

interface PortfolioTableProps {
  activeTab: 'portfolio' | 'watchlist';
  stockData: PortfolioQueryData | undefined;
  portfolioData: any[];
  watchlist: string[];
  onRemoveFromWatchlist: (symbol: string) => void;
  calculateReturns: (symbol: string) => any;
  calculateBuyIndicator: (symbol: string) => number | null;
}

export function PortfolioTable({
  activeTab,
  stockData,
  portfolioData,
  watchlist,
  onRemoveFromWatchlist,
  calculateReturns,
  calculateBuyIndicator
}: PortfolioTableProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const stocks = activeTab === 'portfolio' ? portfolioData : watchlist.map(symbol => ({ symbol, name: symbol, quantity: 0 }));
    
    if (stocks.length === 0) {
        return (
          <YStack height={100} alignItems="center" justifyContent="center" backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"} borderRadius={12} padding="$4" borderWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} marginTop="$4">
            <Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={14}>
              {activeTab === 'portfolio' ? 'No stocks in portfolio' : 'No stocks in watchlist'}
            </Text>
            <Text color={isDark ? "#666" : "#999"} fontFamily="$body" fontSize={14}>
              {activeTab === 'portfolio' ? 'Edit your portfolio to add stocks' : 'Tap + to add stocks to your watchlist'}
            </Text>
          </YStack>
        )}

      return (
        <YStack>
          <XStack borderBottomWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} paddingVertical="$2">
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Symbol</Text>
            {activeTab === 'portfolio' && (
              <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" marginLeft={24} fontFamily="$body">Q</Text>
            )}
            <Text width="9%" color="#dbd0c6" fontSize={14} marginLeft={-24} fontWeight="500" fontFamily="$body">Price</Text>
            {activeTab === 'portfolio' && (
              <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Value</Text>
            )}
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Today</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">YTD</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1W</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1M</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">3M</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">6M</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1Y</Text>
            <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Buy</Text>
          </XStack>
            {stocks.map(stock => {
              if (!stockData) return null;
              const symbol = stock.symbol;
              const currentPrice = stockData.prices?.[symbol] || 0;
              const totalValue = currentPrice * stock.quantity;
              const todayChangePercent = stockData.changePercents?.[symbol] || 0;
              const returns = calculateReturns(symbol);
              const buyScore = calculateBuyIndicator(symbol);
              const renderReturn = (value: number | null) => {
                if (value === null || isNaN(value)) return 'N/A';
                const prefix = value > 0 ? '+' : '';
                return `${prefix}${value.toFixed(2)}%`;
              };
              const getBuyScoreColor = (score: number | null) => {
                if (score === null) return isDark ? "#999" : "#666";
                if (score >= 80) return "#00c853";
                if (score >= 65) return "#4caf50";
                if (score >= 50) return "#8bc34a";
                if (score >= 40) return "#cddc39";
                if (score >= 30) return "#ffc107";
                if (score >= 20) return "#ff9800";
                return "#f44336";
              };
            return (
              <XStack key={symbol} borderBottomWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} paddingVertical="$3" paddingHorizontal="$2" alignItems="center">
                <XStack width="10%" alignItems="center" gap="$1">
                  <Text color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontWeight="500" fontFamily="$body">{symbol}</Text>
                  {activeTab === 'watchlist' && (
                    <Pressable
                      onPress={() => onRemoveFromWatchlist(symbol)}
                      style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1})} >
                      <MaterialIcons name="close" size={16} color={isDark ? "#999" : "#666"}/>
                    </Pressable>
                  )}
                </XStack>
                {activeTab === 'portfolio' && (
                  <Text width="8%" color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontFamily="$body"> {stock.quantity} </Text>
                )}
                  <Text width="10%" color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontFamily="$body">
                  <Text color={isDark ? "#4caf50" : "#2e7d32"} fontSize={10} fontFamily="$body"></Text>{currentPrice.toFixed(2)} </Text>
                {activeTab === 'portfolio' && (
                  <Text  width="10%" color={isDark ? "#4caf50" : "#2e7d32"}  fontSize={14}  fontFamily="$body">
                  <Text color={isDark ? "#4caf50" : "#2e7d32"} fontSize={10} fontFamily="$body"></Text>{totalValue.toFixed(2)}</Text>
                )}
                <Text width="10%" color={getValueColor('portfolio', todayChangePercent, '')} fontSize={14} fontFamily="$body">{renderReturn(todayChangePercent)} </Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['ytd'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['ytd']) : 'N/A'}</Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['1w'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['1w']) : 'N/A'}</Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['1m'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['1m']) : 'N/A'}</Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['3m'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['3m']) : 'N/A'} </Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['6m'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['6m']) : 'N/A'} </Text>
                <Text width="10%" color={getValueColor('portfolio', returns?.['1y'] || 0, '')} fontSize={14} fontFamily="$body"> {returns ? renderReturn(returns['1y']) : 'N/A'} </Text>
                <XStack width="10%" alignItems="center" justifyContent="flex-start">
                  {buyScore !== null ? (
                    <Tooltip placement="top" delay={300}>
                      <Tooltip.Trigger>
                        <XStack alignItems="center">
                          <Text color={getBuyScoreColor(buyScore)} fontSize={14} fontWeight="600" fontFamily="$body" marginRight="$2"> {Math.round(buyScore)}</Text>
                          <YStack width={40} height={10}  backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} borderRadius={6} overflow="hidden">
                          <YStack height="100%" width={`${Math.min(100, Math.max(0, buyScore))}%`} backgroundColor={getBuyScoreColor(buyScore)}/></YStack>
                        </XStack>
                      </Tooltip.Trigger>
                      <Tooltip.Content>
                        <YStack padding="$4" width={300} backgroundColor="rgba(30, 30, 30, 0.95)" borderRadius={12}  borderWidth={1}  borderColor="rgba(255, 255, 255, 0.15)">
                          <Text fontSize={16} fontWeight="600"  fontFamily="$body" color={getBuyScoreColor(buyScore)} marginBottom="$2"> Buy Score: {Math.round(buyScore)}/100</Text>
                          <YStack width="100%" paddingRight={16}>
                            <Text fontSize={13} fontFamily="$body" color="#dbd0c6" marginBottom="$3" fontWeight="500"> Based on 52-week range, recent trends, and price momentum: </Text>
                            <YStack width="100%" gap="$3" marginBottom="$3">
                              <XStack width="100%" gap="$2" alignItems="flex-start">
                                <YStack width={8} height={8} backgroundColor="rgba(219, 208, 198, 0.5)" borderRadius={4} marginTop="$1" marginLeft="$1"/>
                                <YStack width="85%" paddingRight={16}>
                                  <Text fontSize={12} fontFamily="$body" color="#dbd0c6" > Current price position relative to 52-week High/Low (50%)</Text>
                                </YStack>
                              </XStack>
                              <XStack width="100%" gap="$2" alignItems="flex-start">
                                <YStack width={8} height={8} backgroundColor="rgba(219, 208, 198, 0.5)" borderRadius={4} marginTop="$1" marginLeft="$1"/>
                                <YStack width="85%" paddingRight={16}>
                                  <Text fontSize={12} fontFamily="$body" color="#dbd0c6"> Recent performance across multiple timeframes (40%)</Text>
                                </YStack>
                              </XStack>
                              <XStack width="100%" gap="$2" alignItems="flex-start">
                                <YStack width={8} height={8} backgroundColor="rgba(219, 208, 198, 0.5)" borderRadius={4} marginTop="$1" marginLeft="$1"/>
                                <YStack width="85%" paddingRight={16}>
                                  <Text fontSize={12} fontFamily="$body" color="#dbd0c6"> Momentum shifts that indicate potential reversals (10%)</Text>
                                </YStack>
                              </XStack>
                            </YStack>
                            <YStack width="100%" paddingHorizontal={12}>
                              <Text fontSize={13} fontFamily="$body" fontWeight="500" color="#dbd0c6" textAlign="center"> Higher scores suggest better buying opportunities. </Text>
                            </YStack>
                          </YStack>
                        </YStack>
                      </Tooltip.Content>
                    </Tooltip>
                  ) : (
                    <Text color={isDark ? "#999" : "#666"} fontSize={14} fontFamily="$body"> N/A </Text>
                  )}
                </XStack>
              </XStack>
            );
          })}
        </YStack>
      );
    };