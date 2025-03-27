import React, { useState, useCallback } from 'react';
import { useColorScheme, Pressable } from 'react-native';
import { YStack, XStack, Text, Button } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { usePortfolioStore, usePortfolioQuery, removeFromWatchlist } from '@/store/PortfolioStore';
import { portfolioData } from '@/utils/Portfolio';
import { PortfolioQueryData } from '@/types/stocks';
import { useEditStockStore } from '@/store/EditStockStore';
import { PortfolioTable } from '@/components/PortfolioTable';
import { calculateBuyIndicator, calculateReturns } from '@/services/calculationService';

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
  
  const handleRemoveFromWatchlist = async (symbol: string) => {
    await removeFromWatchlist(symbol);
  };
  
  // Create wrapper functions that provide stockData from this component
  const calculateReturnsForSymbol = useCallback((symbol: string) => {
    return calculateReturns(symbol, stockData);
  }, [stockData]);
  
  const calculateBuyIndicatorForSymbol = useCallback((symbol: string) => {
    return calculateBuyIndicator(symbol, stockData, calculateReturns);
  }, [stockData]);
  
  return (
    <YStack>
      <XStack marginBottom="$3" alignItems="center">
        <Button
          backgroundColor={activeTab === 'portfolio' ? 'rgba(219, 208, 198, 0.2)' : 'transparent'}
          br={8}
          px="$3"
          py="$1"
          onPress={() => setActiveTab('portfolio')}
        >
          <Text color="#dbd0c6" fontSize={14} fontFamily="$body">Portfolio</Text>
        </Button>
        <XStack alignItems="center">
          <Button
            backgroundColor={activeTab === 'watchlist' ? 'rgba(219, 208, 198, 0.2)' : 'transparent'}
            br={8}
            px="$3"
            py="$1"
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
            <MaterialIcons name="add" size={20} color="#dbd0c6" />
          </Pressable>
        </XStack>
      </XStack>
      {isLoading ? (
        <YStack
          height={100}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          br={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
          mt="$4"
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
          calculateReturns={calculateReturnsForSymbol}
          calculateBuyIndicator={calculateBuyIndicatorForSymbol}
        />
      )}
    </YStack>
  );
}