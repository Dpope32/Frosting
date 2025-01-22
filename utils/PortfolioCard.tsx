
// src/utils/PortfolioCard.tsx
import { Stack, Text } from 'tamagui';
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { portfolioData } from './Portfolio';  // Fixed casing here

export function PortfolioCard() {
  const { data: prices, isLoading } = useQuery({
    queryKey: ['stock-prices'],
    queryFn: async () => {
      const symbols = portfolioData.map(stock => stock.symbol).join(',');
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${symbols}&vs_currencies=usd`
      );
      return response.json();
    },
    staleTime: 1000 * 60,
  });

  const calculateTotal = () => {
    if (!prices || isLoading) return 0;
    return portfolioData.reduce((acc, stock) => {
      const price = prices[stock.symbol.toLowerCase()]?.usd ?? 0;
      return acc + (price * stock.quantity);
    }, 0);
  };

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={8}
      padding="$2"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.5)"
      minWidth={70}
      alignItems="center"
      justifyContent="center"
    >
      <Text
        color="#FF9800"
        fontSize={11}
        opacity={0.9}
        marginBottom="$0.5"
      >
        Portfolio
      </Text>
      <Text
        color="white"
        fontSize={14}
        fontWeight="bold"
      >
        {isLoading ? '...' : `$${calculateTotal().toLocaleString()}`}
      </Text>
    </Stack>
  );
}