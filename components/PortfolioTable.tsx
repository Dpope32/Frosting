import React from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Tooltip } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { getValueColor } from '@/constants/valueHelper';
import { PortfolioQueryData } from '@/types/stocks';
import { ReturnType } from '@/services/calculationService';
import { Stock } from '@/types';

interface PortfolioTableProps {
  activeTab: 'portfolio' | 'watchlist';
  stockData: PortfolioQueryData | undefined;
  portfolioData: Stock[];
  watchlist: string[];
  onRemoveFromWatchlist: (symbol: string) => void;
  calculateReturns: (symbol: string) => ReturnType | null;
  calculateBuyIndicator: (symbol: string) => number | null;
  totalPortfolioValue: number;
}

export function PortfolioTable({
  activeTab,
  stockData,
  portfolioData,
  watchlist,
  onRemoveFromWatchlist,
  calculateReturns,
  calculateBuyIndicator,
  totalPortfolioValue
}: PortfolioTableProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const stocks = activeTab === 'portfolio'
    ? portfolioData
    : watchlist.map(symbol => ({ symbol, name: symbol, quantity: 0 }));
  if (stocks.length === 0) {
    return (
      <YStack height={100} alignItems="center" justifyContent="center" bc={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"} br={12} padding="$4" borderWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} mt="$4">
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
    <YStack paddingLeft="$3">
      <XStack borderBottomWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} py="$2">
        <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Symbol</Text>
        {activeTab === 'portfolio' && (
          <Text width="5%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Q</Text>
        )}
        <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Price</Text>
        {activeTab === 'portfolio' && (
          <Text width="10%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Value</Text>
        )}
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Today</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">YTD</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1W</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1M</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">3M</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">6M</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">1Y</Text>
        <Text width="8%" color="#dbd0c6" fontSize={14} fontWeight="500" fontFamily="$body">Buy</Text>
      </XStack>
      {stocks.map((stock, index) => {
        if (!stockData) return null;
        const symbol = stock.symbol;
        const currentPrice = stockData.prices?.[symbol] || 0;
        const totalValue = currentPrice * stock.quantity;
        const todayChangePercent = stockData.changePercents?.[symbol] || 0;
        const returns = calculateReturns(symbol);
        const buyScore = calculateBuyIndicator(symbol);
        const renderReturn = (value: number | null | undefined) => {
          if (value === null || value === undefined || isNaN(value)) return 'N/A';
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
          <XStack key={symbol} borderBottomWidth={1} borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} py="$3" px="$2" alignItems="center" backgroundColor={index % 2 === 0 ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)') : 'transparent'}>
            <XStack width="10%" alignItems="center" gap="$1">
              <Text color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontWeight="500" fontFamily="$body">{symbol}</Text>
              {activeTab === 'watchlist' && (
                <Pressable onPress={() => onRemoveFromWatchlist(symbol)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                  <MaterialIcons name="close" size={16} color={isDark ? "#999" : "#666"} />
                </Pressable>
              )}
            </XStack>
            {activeTab === 'portfolio' && (
              <Text width="5%" color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontFamily="$body">{stock.quantity}</Text>
            )}
            <Text width="10%" color={isDark ? "#e6e6e6" : "#000"} fontSize={14} fontFamily="$body">{currentPrice ? currentPrice.toFixed(2) : 'N/A'}</Text>
            {activeTab === 'portfolio' && (
            <Text width="10%" color={isDark ? "#4caf50" : "#2e7d32"} fontSize={14} fontFamily="$body">{totalValue ? totalValue.toFixed(2) : 'N/A'}</Text>
            )}
            <Text width="8%" color={getValueColor('portfolio', todayChangePercent, '')} fontSize={14} fontFamily="$body">{renderReturn(todayChangePercent)}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['ytd'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['ytd']) : 'N/A'}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['1w'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['1w']) : 'N/A'}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['1m'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['1m']) : 'N/A'}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['3m'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['3m']) : 'N/A'}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['6m'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['6m']) : 'N/A'}</Text>
            <Text width="8%" color={getValueColor('portfolio', returns?.['1y'] || 0, '')} fontSize={14} fontFamily="$body">{returns ? renderReturn(returns['1y']) : 'N/A'}</Text>
            <XStack width="8%" alignItems="center" justifyContent="flex-start">
              {buyScore !== null ? (
                <Tooltip placement="top" delay={300}>
                  <Tooltip.Trigger>
                    <XStack alignItems="center">
                      <Text color={getBuyScoreColor(buyScore)} fontSize={14} fontWeight="600" fontFamily="$body" marginRight="$2">{Math.round(buyScore)}</Text>
                      <YStack width={40} height={10} bc={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} br={6} overflow="hidden">
                        <YStack height="100%" width={`${Math.min(100, Math.max(0, buyScore))}%`} bc={getBuyScoreColor(buyScore)} />
                      </YStack>
                    </XStack>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <YStack padding="$4" width={300} bc="rgba(30, 30, 30, 0.95)" br={12} borderWidth={1} borderColor="rgba(255, 255, 255, 0.15)">
                      <Text fontSize={16} fontWeight="600" fontFamily="$body" color={getBuyScoreColor(buyScore)} marginBottom="$2">Buy Score: {Math.round(buyScore)}/100</Text>
                      <YStack width="100%" paddingRight={16}>
                        <Text fontSize={13} fontFamily="$body" color="#dbd0c6" marginBottom="$3" fontWeight="500">Based on 52-week range, recent trends, and price momentum:</Text>
                        <YStack width="100%" gap="$3" marginBottom="$3">
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={16}>
                              <Text fontSize={12} fontFamily="$body" color="#dbd0c6">Current price position relative to 52-week High/Low (50%)</Text>
                            </YStack>
                          </XStack>
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={16}>
                              <Text fontSize={12} fontFamily="$body" color="#dbd0c6">Recent performance across multiple timeframes (40%)</Text>
                            </YStack>
                          </XStack>
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={16}>
                              <Text fontSize={12} fontFamily="$body" color="#dbd0c6">Momentum shifts that indicate potential reversals (10%)</Text>
                            </YStack>
                          </XStack>
                        </YStack>
                        <YStack width="100%" px={12}>
                          <Text fontSize={13} fontFamily="$body" fontWeight="500" color="#dbd0c6" textAlign="center">Higher scores suggest better buying opportunities.</Text>
                        </YStack>
                      </YStack>
                    </YStack>
                  </Tooltip.Content>
                </Tooltip>
              ) : (
                <Text color={isDark ? "#999" : "#666"} fontSize={14} fontFamily="$body">N/A</Text>
              )}
            </XStack>
          </XStack>
        );
      })}
      {activeTab === 'portfolio' && (
        <XStack borderTopWidth={1} borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} py="$2" px="$2" alignItems="center">
          <Text width="25%" textAlign="right" fontSize={14} fontFamily="$body">Total</Text>
          <Text width="10%" textAlign="right" fontSize={14} fontFamily="$body" color={getValueColor('portfolio', totalPortfolioValue, '')}>{totalPortfolioValue ? totalPortfolioValue.toFixed(2) : 'N/A'}</Text>
          <XStack flex={1} />
        </XStack>
      )}
    </YStack>
  );
}
