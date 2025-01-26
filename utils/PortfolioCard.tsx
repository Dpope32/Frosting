import React, { useEffect } from 'react';
import { Stack, Text } from 'tamagui';
import { getValueColor } from '@/constants/valueHelper';
import { usePortfolioQuery, usePortfolioStore } from '@/store/PortfolioStore';
import { storage } from '@/store/MMKV';

const isMarketHours = () => {
  const now = new Date();
  const day = now.getDay();
  
  // Convert current time to ET
  const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
  const hours = etNow.getHours();
  const minutes = etNow.getMinutes();
  const currentTime = hours * 100 + minutes;
  
  // Check if it's a weekday (1-5) and between 9:30 AM and 4:00 PM ET
  return day >= 1 && day <= 5 && currentTime >= 930 && currentTime <= 1600;
};

export function PortfolioCard() {
  const { isLoading, refetch } = usePortfolioQuery();
  const totalValue = usePortfolioStore((state: { totalValue: number | null }) => state.totalValue);

  useEffect(() => {
    if (isMarketHours()) {
      refetch();
    }
  }, [refetch]);

  const lastUpdate = storage.getString('portfolio_last_update');
  const lastUpdateText = lastUpdate 
    ? new Date(lastUpdate).toLocaleTimeString()
    : 'Not available';

  const displayValue = isLoading
    ? 'Loading...'
    : totalValue !== null
    ? `$${Math.round(totalValue).toLocaleString()}`
    : '$0';

  const valueColor = getValueColor('portfolio', totalValue ?? 0, '');

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={12}
      padding="$3"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      minWidth={90}
      alignItems="center"
      justifyContent="center"
      gap="$1"
    >
      <Text
        color={valueColor}
        fontSize={18}
        fontWeight="bold"
        fontFamily="$SpaceMono"
      >
        {displayValue}
      </Text>
    </Stack>
  );
}
