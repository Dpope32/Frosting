import React, { useState, useCallback } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Button, Tooltip } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { usePortfolioStore, usePortfolioQuery, removeFromWatchlist } from '@/store/PortfolioStore';
import { portfolioData } from '@/utils/Portfolio';
import { getValueColor } from '@/constants/valueHelper';
import { PortfolioQueryData } from '@/types/stocks';
import { useEditStockStore } from '@/store/EditStockStore';
import { PortfolioTable } from '@/components/PortfolioTable';

export function AssetSection({ onAddToWatchlist }: { onAddToWatchlist: () => void }) {
  const { data, isLoading, refetch } = usePortfolioQuery();
  const stockData = data as PortfolioQueryData | undefined;
  const { watchlist } = usePortfolioStore();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [activeTab, setActiveTab] = useState<'portfolio' | 'watchlist'>('portfolio');
  
  React.useEffect(() => {
    const timer = setTimeout(() => {
      refetch();
    }, 500);
    return () => clearTimeout(timer);
  }, [refetch]);

  const openAddStockModal = useCallback(() => {
    useEditStockStore.setState({ isOpen: true, selectedStock: undefined });
  }, []);

  const calculateBuyIndicator = (symbol: string) => {
    if (!stockData) return null;
    const currentPrice = stockData.prices[symbol] || 0;
    const fiftyTwoWeekHigh = stockData.fiftyTwoWeekHigh?.[symbol] || 0;
    const fiftyTwoWeekLow = stockData.fiftyTwoWeekLow?.[symbol] || 0;
    if (fiftyTwoWeekHigh <= fiftyTwoWeekLow || currentPrice <= 0) return null;
    const returns = calculateReturns(symbol);
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
    const combinedScore =
      (fiftyTwoWeekScore * 0.5) +
      (trendScore * 0.4) +
      momentumFactor;
    return Math.min(100, Math.max(0, combinedScore));
  };

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
    const stock = portfolioData.find(s => s.symbol === symbol);
    const purchasePrice = stock?.purchasePrice || 0;
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
          <Pressable
            onPress={() => {
              if (activeTab === 'watchlist') {
                onAddToWatchlist();
              } else {
                openAddStockModal();
              }
            }}
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
    ) : (
      <PortfolioTable
        activeTab={activeTab}
        stockData={stockData}
        portfolioData={portfolioData}
        watchlist={watchlist}
        onRemoveFromWatchlist={handleRemoveFromWatchlist}
        calculateReturns={calculateReturns}
        calculateBuyIndicator={calculateBuyIndicator}
      />
    )}
  </YStack>
);
}
