import React, { useEffect } from 'react';
import { Stack, Text, YStack } from 'tamagui';
import { getValueColor } from '@/constants/valueHelper';
import { usePortfolioQuery, usePortfolioStore } from '@/store/PortfolioStore';
import { StorageUtils } from '@/store/MMKV';

export function PortfolioCard() {
  const { isLoading, refetch } = usePortfolioQuery();
  const totalValue = usePortfolioStore((state) => state.totalValue);
  const lastUpdate = StorageUtils.get<string>('portfolio_last_update');

  useEffect(() => {
    const isMarketHours = () => {
      const now = new Date();
      const day = now.getDay();
      const etNow = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
      const hours = etNow.getHours();
      const minutes = etNow.getMinutes();
      const currentTime = hours * 100 + minutes;
      return day >= 1 && day <= 5 && currentTime >= 930 && currentTime <= 1600;
    };

    if (isMarketHours()) {
      refetch();
    }
  }, [refetch]);

  const displayValue = isLoading
    ? 'Loading...'
    : totalValue !== null
    ? `$${totalValue.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2,
        notation: 'compact',
        compactDisplay: 'short'
      })}`
    : '$0.00';

  const valueColor = getValueColor('portfolio', totalValue ?? 0, '');
  const lastUpdateTime = lastUpdate ? new Date(lastUpdate) : null;
  const isStale = lastUpdateTime && (new Date().getTime() - lastUpdateTime.getTime()) > 5 * 60 * 1000;

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
      gap="$0.5"
    >
      <Text
        color={valueColor}
        fontSize={18}
        fontWeight="bold"
        textAlign="center"
        numberOfLines={1}
        style={{
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 0, height: 1 },
          textShadowRadius: 2
        }}
      >
        {displayValue}
      </Text>
    </Stack>
  );
}
