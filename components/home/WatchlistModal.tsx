import React, { useState, useEffect } from 'react'; 
import { YStack, Text, Input, Button, XStack, ScrollView, isWeb, useTheme } from 'tamagui';
import { useColorScheme } from 'react-native';
import { BaseCardModal } from '@/components/baseModals/BaseCardModal';
import { useUserStore } from '@/store/UserStore';
import { addToWatchlist, usePortfolioStore } from '@/store/PortfolioStore';
import { useQueryClient } from '@tanstack/react-query';
import { initializeStocksData, searchStocks, getRecommendedStocks} from '@/services';
import { StockData } from '@/constants/stocks';
import { getIconForStock } from '../../constants/popularStocks'
import { debounce } from 'lodash';

interface WatchlistModalProps { open: boolean; onOpenChange: (open: boolean) => void}

export function WatchlistModal({ open, onOpenChange }: WatchlistModalProps) {
  const [symbol, setSymbol] = useState('');
  const [error, setError] = useState('');
  const [searchResults, setSearchResults] = useState<StockData[]>([]);
  const [recommendedStocks, setRecommendedStocks] = useState<StockData[]>([]);
  const [stocksInitialized, setStocksInitialized] = useState(false);
  const [watchlistedSymbols, setWatchlistedSymbols] = useState<string[]>([]);
  
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const queryClient = useQueryClient();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = useTheme();
  
  useEffect(() => {
    const initStocks = async () => {
      try {
        const currentWatchlist = usePortfolioStore.getState().watchlist;
        setWatchlistedSymbols(currentWatchlist);
        if (!stocksInitialized) {
          await initializeStocksData();
          setStocksInitialized(true);
        }
        const recommended = getRecommendedStocks(currentWatchlist);
        setRecommendedStocks(recommended);
      } catch (error) {
        console.error('Failed to initialize stocks data:', error);
      }
    };
    if (open) {
      initStocks();
    }
  }, [open]);
  
  useEffect(() => {
    if (!open) {
      setSymbol('');
      setSearchResults([]);
      setError('');
    }
  }, [open]);
  
  const debouncedSearch = React.useCallback(
    debounce((query: string) => {
      if (query.trim().length > 0) {
        const results = searchStocks(query);
        const filteredResults = results.filter(stock => !watchlistedSymbols.includes(stock.symbol));
        setSearchResults(filteredResults);
      } else {
        setSearchResults([]);
      }
    }, 300),
    [stocksInitialized, watchlistedSymbols]
  );
  
  const handleInputChange = (value: string) => {
    setSymbol(value);
    setError('');
    debouncedSearch(value);
  };
  
  const handleAddToWatchlist = async (stockSymbol: string = symbol) => {
    if (!stockSymbol) {
      setError('Please enter a stock symbol');
      return;
    }
    try {
      await addToWatchlist(stockSymbol.toUpperCase());
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] });
      const updatedWatchlist = [...watchlistedSymbols, stockSymbol.toUpperCase()];
      setWatchlistedSymbols(updatedWatchlist);
      setRecommendedStocks(prev => prev.filter(s => s.symbol !== stockSymbol));
      setSearchResults(prev => prev.filter(s => s.symbol !== stockSymbol));
      setSymbol('');
      onOpenChange(false);
    } catch (err) {
      setError('Failed to add to watchlist. Please try again.');
    }
  };
  
  const handleSelectStock = (stock: StockData) => {
    handleAddToWatchlist(stock.symbol);
  };
  
  const renderStockIcon = (symbol: string, size: number, color: string) => {
    try {
      const iconData = getIconForStock(symbol);
      const { Component, type } = iconData;
      if (type === 'lucide') {
        return <Component size={size} color={color} />;
      } else if (type === 'brand' || type === 'solid') {
        return <Component name={iconData.name} size={size} color={color} />;
      } else if (type === 'material') {
        return <Component name={iconData.name} size={size} color={color} />;
      }
      return <Text fontSize={size} color={color}>$</Text>;
    } catch (err) {
      console.error(`Error rendering icon for ${symbol}:`, err);
      return <Text fontSize={size} color={color}>$</Text>;
    }
  };
  
  return (
    <BaseCardModal open={open} onOpenChange={onOpenChange} title="Add to Watchlist" hideHandle={true}>
      <YStack flex={1} position="relative">
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 100 }}>
          <YStack gap="$3" py="$2">
            <YStack>
              <Text color={isDark ? "$color11" : "$color10"} fontSize={12} marginBottom="$1" fontFamily="$body">
                Stock Symbol
              </Text>
              <Input
                value={symbol}
                onChangeText={handleInputChange}
                placeholder="e.g. AAPL"
                placeholderTextColor="$color11"
                autoCapitalize="characters"
                backgroundColor={isDark ? "$backgroundHover" : "$background"}
                borderColor="$borderColor"
                height={40}
                br={8}
                px="$2"
              />
            </YStack>
            {error ? (
              <Text color="$red10" fontSize={12} textAlign="center" backgroundColor="$red2" padding="$2" br={6}>
                {error}
              </Text>
            ) : null}
            {searchResults.length > 0 && (
              <YStack gap="$2">
                <Text color={isDark ? "$color11" : "$color10"} fontSize={14} fontWeight="500" fontFamily="$body">
                  Search Results
                </Text>
                <YStack backgroundColor={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.05)"} br={8} padding="$2" maxHeight={200}>
                  <ScrollView showsVerticalScrollIndicator={false}>
                    <YStack gap="$2">
                      {searchResults.map(stock => (
                        <XStack
                          key={stock.symbol}
                          backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"}
                          br={8}
                          padding="$2"
                          alignItems="center"
                          justifyContent="space-between"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => handleSelectStock(stock)}
                        >
                          <XStack alignItems="center" gap="$2" flex={1}>
                            <XStack
                              width={32}
                              height={32}
                              br={16}
                              backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                              alignItems="center"
                              justifyContent="center"
                            >
                              {renderStockIcon(stock.symbol, 16, isDark ? theme.color11.get() : theme.color10.get())}
                            </XStack>
                            <YStack>
                              <Text color={isDark ? "$color" : "$color12"} fontWeight="600" fontSize={14} fontFamily="$body">
                                {stock.symbol}
                              </Text>
                              <Text color={isDark ? "$color11" : "$color10"} fontSize={12} fontFamily="$body" numberOfLines={1}>
                                {stock.name}
                              </Text>
                            </YStack>
                          </XStack>
                          <Button
                            size="$2"
                            backgroundColor={primaryColor}
                            br={4}
                            px="$2"
                            onPress={() => handleSelectStock(stock)}
                          >
                            <Text color="#fff" fontSize={12} fontWeight="500">
                              Add
                            </Text>
                          </Button>
                        </XStack>
                      ))}
                    </YStack>
                  </ScrollView>
                </YStack>
              </YStack>
            )}
            {recommendedStocks.length > 0 ? (
              <YStack gap="$2" flex={1}>
                <Text color={isDark ? "$color11" : "$color10"} fontSize={14} fontWeight="500" fontFamily="$body">
                  Recommended Stocks
                </Text>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <YStack gap="$3">
                    {isWeb ? (
                      <XStack flexWrap="wrap" gap="$2" justifyContent="flex-start">
                        {recommendedStocks.map(stock => (
                          <Button
                            key={stock.symbol}
                            backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)"}
                            br={8}
                            padding="$2"
                            width="19%"
                            height={45}
                            onPress={() => handleSelectStock(stock)}
                            pressStyle={{ opacity: 0.7 }}
                          >
                            <XStack alignItems="center" gap="$1" width="100%">
                              <XStack
                                width={24}
                                height={24}
                                br={12}
                                backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                                alignItems="center"
                                justifyContent="center"
                                marginRight="$1"
                              >
                                {renderStockIcon(stock.symbol, 14, isDark ? theme.color11.get() : theme.color10.get())}
                              </XStack>
                              <YStack flex={1}>
                                <Text color={isDark ? "$color" : "$color12"} fontWeight="600" fontSize={12} fontFamily="$body">
                                  {stock.symbol}
                                </Text>
                                <Text color={isDark ? "$color11" : "$color10"} fontSize={9} fontFamily="$body" numberOfLines={1}>
                                  {stock.name}
                                </Text>
                              </YStack>
                            </XStack>
                          </Button>
                        ))}
                      </XStack>
                    ) : (
                      <XStack flexWrap="wrap" gap="$2" justifyContent="space-between">
                        {recommendedStocks.map(stock => (
                          <XStack
                            key={stock.symbol}
                            backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(255,255,255,0.8)"}
                            br={8}
                            padding="$2"
                            alignItems="center"
                            width="48%"
                            height={50}
                            marginBottom="$2"
                            pressStyle={{ opacity: 0.7 }}
                            onPress={() => handleSelectStock(stock)}
                          >
                            <XStack alignItems="center" gap="$2" flex={1}>
                              <XStack
                                width={30}
                                height={30}
                                br={15}
                                backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
                                alignItems="center"
                                justifyContent="center"
                              >
                                {renderStockIcon(stock.symbol, 16, isDark ? theme.color11.get() : theme.color10.get())}
                              </XStack>
                              <YStack flex={1}>
                                <Text color={isDark ? "$color" : "$color12"} fontWeight="600" fontSize={14} fontFamily="$body">
                                  {stock.symbol}
                                </Text>
                                <Text color={isDark ? "$color11" : "$color10"} fontSize={11} fontFamily="$body" numberOfLines={1}>
                                  {stock.name}
                                </Text>
                              </YStack>
                            </XStack>
                          </XStack>
                        ))}
                      </XStack>
                    )}
                  </YStack>
                </ScrollView>
              </YStack>
            ) : (
              <YStack padding="$4" alignItems="center" justifyContent="center" backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"} br={8} flex={1} mt="$2">
                <Text color={isDark ? "$color11" : "$color10"} fontSize={14} textAlign="center" fontFamily="$body">
                  All recommended stocks have been added to your watchlist. 
                  </Text>
                <Text color={isDark ? "$color11" : "$color10"} fontSize={12} textAlign="center" mt="$2" fontFamily="$body">
                  You can search for additional stocks using the search box above.
                </Text>
              </YStack>
            )}
          </YStack>
        </ScrollView>
        <Button
          backgroundColor={primaryColor}
          height={50}
          br={8}
          opacity={!symbol ? 0.5 : 1}
          disabled={!symbol}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          onPress={() => handleAddToWatchlist()}
          position="absolute"
          bottom={-200}
          left={20}
          right={20}
        >
          <Text color="#fff" fontWeight="600" fontSize={16} fontFamily="$body">
            Add to Watchlist
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  );
}
