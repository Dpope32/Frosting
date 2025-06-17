import React from 'react';
import { useColorScheme, Pressable, useWindowDimensions } from 'react-native';
import { YStack, XStack, Text, Tooltip, isWeb, useMedia } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { getValueColor } from '@/constants';
import { PortfolioQueryData } from '@/types/stocks';
import { ReturnType } from '@/services/stocks/calculationService';
import { Stock } from '@/types/stocks';
import { usePortfolioStore } from '@/store'

interface PortfolioTableProps {
  activeTab: 'portfolio' | 'watchlist';
  stockData: PortfolioQueryData | undefined;
  portfolioData: Stock[];
  watchlist: string[];
  onRemoveFromWatchlist: (symbol: string) => void;
  onEditStock: (stock: Stock) => void;
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
  onEditStock,
  calculateReturns,
  calculateBuyIndicator,
  totalPortfolioValue
}: PortfolioTableProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { totalValue } = usePortfolioStore()
  const currentTotalValue = totalValue ?? 0
  const stocks = activeTab === 'portfolio' ? portfolioData : watchlist.map(symbol => ({ symbol, name: symbol, quantity: 0 }));
  
  // Responsive breakpoints
  const windowDimensions = useWindowDimensions();
  const screenWidth = windowDimensions.width;
  const isSmallScreen = screenWidth < 1200;  // MacBook Air and smaller
  const isMediumScreen = screenWidth >= 1200 && screenWidth < 1800;  // Standard desktop
  const isLargeScreen = screenWidth >= 1800;  // Large monitors like 2400px
  
  // Dynamic decimal places based on screen size
  const decimalPlaces = isSmallScreen ? 1 : 2;
  
  // Responsive font sizes
  const headerFontSize = isLargeScreen ? 16 : isMediumScreen ? 15 : 14;
  const bodyFontSize = isLargeScreen ? 15 : isMediumScreen ? 14 : 13;
  
  // Responsive column widths
  const getColumnWidth = (column: string) => {
    if (isSmallScreen) {
      switch (column) {
        case 'symbol': return '12%';
        case 'quantity': return '6%';
        case 'price': return '12%';
        case 'value': return '12%';
        case 'percentage': return '9%';
        case 'buy': return '10%';
        default: return '8%';
      }
    } else if (isMediumScreen) {
      switch (column) {
        case 'symbol': return '11%';
        case 'quantity': return '5%';
        case 'price': return '11%';
        case 'value': return '11%';
        case 'percentage': return '8%';
        case 'buy': return '9%';
        default: return '8%';
      }
    } else {
      // Large screen
      switch (column) {
        case 'symbol': return '10%';
        case 'quantity': return '5%';
        case 'price': return '10%';
        case 'value': return '10%';
        case 'percentage': return '8%';
        case 'buy': return '8%';
        default: return '8%';
      }
    }
  };
  
  // Responsive padding
  const containerPadding = isLargeScreen ? '$4' : isMediumScreen ? '$3' : '$3';
  const rowPadding = isLargeScreen ? '$3' : '$2';

  if (stocks.length === 0) {
    return (
      <YStack 
        height={isLargeScreen ? 120 : 100} 
        alignItems="center" 
        justifyContent="center" 
        bc={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"} 
        br={isLargeScreen ? 16 : 12} 
        padding={containerPadding} 
        borderWidth={1} 
        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
        mt="$4"
      >
        <Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={bodyFontSize}>
          {activeTab === 'portfolio' ? 'No stocks in portfolio' : 'No stocks in watchlist'}
        </Text>
        <Text color={isDark ? "#666" : "#999"} fontFamily="$body" fontSize={bodyFontSize - 1}>
          {activeTab === 'portfolio' ? 'Edit your portfolio to add stocks' : 'Tap + to add stocks to your watchlist'}
        </Text>
      </YStack>
    );
  }
  
  return (
    <YStack paddingLeft={containerPadding}>
      <XStack 
        borderBottomWidth={1} 
        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
        py={rowPadding}
      >
        <Text width={getColumnWidth('symbol')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Symbol</Text>
        {activeTab === 'portfolio' && (
          <Text width={getColumnWidth('quantity')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Q</Text>
        )}
        <Text width={getColumnWidth('price')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Price</Text>
        {activeTab === 'portfolio' && (
          <Text width={getColumnWidth('value')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Value</Text>
        )}
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Today</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">YTD</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">1W</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">1M</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">3M</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">6M</Text>
        <Text width={getColumnWidth('percentage')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">1Y</Text>
        <Text width={getColumnWidth('buy')} color="#dbd0c6" fontSize={headerFontSize} fontWeight="500" fontFamily="$body">Buy</Text>
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
          return `${prefix}${value.toFixed(decimalPlaces)}%`;
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
          <XStack 
            key={symbol} 
            borderBottomWidth={1} 
            borderColor={isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"} 
            py={rowPadding} 
            px={rowPadding} 
            alignItems="center" 
            backgroundColor={index % 2 === 0 ? (isDark ? 'rgba(0,0,0,0.1)' : 'rgba(0,0,0,0.02)') : 'transparent'}
          >
            <XStack width={getColumnWidth('symbol')} alignItems="center" gap="$1">
              <Text color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontWeight="500" fontFamily="$body">{symbol}</Text>
              {activeTab === 'watchlist' && (
                <Pressable onPress={() => onRemoveFromWatchlist(symbol)} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
                  <MaterialIcons name="close" size={isLargeScreen ? 16 : 14} color={isDark ? "#999" : "#666"} />
                </Pressable>
              )}
            </XStack>
            {activeTab === 'portfolio' && (
              <Text width={getColumnWidth('quantity')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body">{stock.quantity}</Text>
            )}
            <Text width={getColumnWidth('price')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body">
              {typeof currentPrice === 'number' && !isNaN(currentPrice) ? `$${currentPrice.toFixed(2)}` : 'N/A'}
            </Text>
            {activeTab === 'portfolio' && (
              <Text width={getColumnWidth('value')} color={isDark ? "#4caf50" : "#2e7d32"} fontSize={bodyFontSize} fontFamily="$body">
                {typeof totalValue === 'number' && !isNaN(totalValue) ? `$${totalValue.toFixed(2)}` : 'N/A'}
              </Text>
            )}
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', todayChangePercent, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {renderReturn(todayChangePercent)}
            </Text>
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['ytd'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {returns ? renderReturn(returns['ytd']) : 'N/A'}
            </Text>
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['1w'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {returns ? renderReturn(returns['1w']) : 'N/A'}
            </Text>
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['1m'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {returns ? renderReturn(returns['1m']) : 'N/A'}
            </Text>
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['3m'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {returns ? renderReturn(returns['3m']) : 'N/A'}
            </Text>
                         <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['6m'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
               {returns ? renderReturn(returns['6m']) : 'N/A'}
             </Text>
            <Text width={getColumnWidth('percentage')} color={getValueColor('portfolio', returns?.['1y'] || 0, '', isDark)} fontSize={bodyFontSize} fontFamily="$body">
              {returns ? renderReturn(returns['1y']) : 'N/A'}
            </Text>
            <XStack width={getColumnWidth('buy')} alignItems="center" justifyContent="flex-start">
              {buyScore !== null ? (
                <Tooltip placement="top" delay={300}>
                  <Tooltip.Trigger>
                    <XStack alignItems="center">
                      <Text color={getBuyScoreColor(buyScore)} fontSize={bodyFontSize} fontWeight="600" fontFamily="$body" marginRight="$2">
                        {Math.round(buyScore)}
                      </Text>
                      <YStack 
                        width={isLargeScreen ? 50 : 40} 
                        height={isLargeScreen ? 12 : 10} 
                        bc={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"} 
                        br={6} 
                        overflow="hidden"
                      >
                        <YStack height="100%" width={`${Math.min(100, Math.max(0, buyScore))}%`} bc={getBuyScoreColor(buyScore)} />
                      </YStack>
                    </XStack>
                  </Tooltip.Trigger>
                  <Tooltip.Content>
                    <YStack 
                      padding="$4" 
                      width={isLargeScreen ? 350 : 300} 
                      bc="rgba(30, 30, 30, 0.95)" 
                      br={12} 
                      borderWidth={1} 
                      borderColor="rgba(255, 255, 255, 0.15)"
                    >
                      <Text fontSize={14} fontWeight="600" fontFamily="$body" color={getBuyScoreColor(buyScore)} marginBottom="$2">Buy Score: {Math.round(buyScore)}/100</Text>
                      <YStack width="100%" paddingRight={14}>
                        <Text fontSize={13} fontFamily="$body" color="#dbd0c6" marginBottom="$3" fontWeight="500">Based on 52-week range, recent trends, and price momentum:</Text>
                        <YStack width="100%" gap="$3" marginBottom="$3">
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={14}>
                              <Text fontSize={12} fontFamily="$body" color="#dbd0c6">Current price position relative to 52-week High/Low (50%)</Text>
                            </YStack>
                          </XStack>
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={14}>
                              <Text fontSize={12} fontFamily="$body" color="#dbd0c6">Recent performance across multiple timeframes (40%)</Text>
                            </YStack>
                          </XStack>
                          <XStack width="100%" gap="$2" alignItems="flex-start">
                            <YStack width={8} height={8} bc="rgba(219, 208, 198, 0.5)" br={4} mt="$1" marginLeft="$1" />
                            <YStack width="85%" paddingRight={14}>
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
                <Text color={isDark ? "#999" : "#666"} fontSize={bodyFontSize} fontFamily="$body">N/A</Text>
              )}
            </XStack>
            {activeTab === 'portfolio' && (
              <Pressable
                onPress={() => {
                  onEditStock(stock);
                }}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  padding: isLargeScreen ? 10 : 8,
                })}
              >
                <MaterialIcons name="edit" size={isLargeScreen ? 18 : 16} color="#888" />
              </Pressable>
            )}
          </XStack>
        );
      })}
      {activeTab === 'portfolio' && (
        <XStack 
          borderTopWidth={1} 
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"} 
          py={rowPadding} 
          px={rowPadding} 
          alignItems="center"
        >
          <Text width={getColumnWidth('symbol')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontWeight="500" fontFamily="$body">Total</Text>
          {activeTab === 'portfolio' && (
            <Text width={getColumnWidth('quantity')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          )}
          <Text width={getColumnWidth('price')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('value')} color={getValueColor('portfolio', totalPortfolioValue, '', isDark)} fontSize={bodyFontSize} fontWeight="500" fontFamily="$body">
            ${currentTotalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
          <Text width={getColumnWidth('percentage')} color={isDark ? "#e6e6e6" : "#000"} fontSize={bodyFontSize} fontFamily="$body"></Text>
        </XStack>
      )}
    </YStack>
  );
}
