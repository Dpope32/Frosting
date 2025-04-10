import React, { useEffect, useState } from 'react';
import { isWeb, Stack, Text } from 'tamagui';
import { getValueColor } from '@/constants/valueHelper';
import { usePortfolioQuery, usePortfolioStore } from '@/store/PortfolioStore';
import { StorageUtils } from '@/store/AsyncStorage';

interface PortfolioCardProps {
  roundToWholeNumber?: boolean;
}

export function PortfolioCard({ roundToWholeNumber = false }: PortfolioCardProps) {
  const { isLoading, refetch } = usePortfolioQuery();
  const totalValue = usePortfolioStore((state) => state.totalValue);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  
  // Load last update time
  useEffect(() => {
    let mounted = true;
    
    StorageUtils.get<string>('portfolio_last_update')
      .then(updateTime => {
        if (mounted && updateTime) {
          setLastUpdate(updateTime);
        }
      })
      .catch(error => {
        console.error('Error loading last update time:', error);
      });
      
    return () => {
      mounted = false;
    };
  }, [totalValue]); // Reload when totalValue changes, as this indicates a portfolio update

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

  const displayValue = isLoading ? '...'
    : totalValue !== null ? `$${totalValue.toLocaleString('en-US', { 
        minimumFractionDigits: roundToWholeNumber ? 0 : 2, 
        maximumFractionDigits: roundToWholeNumber ? 0 : 2,
        notation: 'compact',
        compactDisplay: 'short'
      })}`
    : '$0.00';

  const valueColor = getValueColor('portfolio', totalValue ?? 0, '');

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      br={12}
      padding="$3"
      borderWidth={1}
      borderColor="rgba(255, 255, 255, 0.1)"
      minWidth={80}
      height={isWeb ? 60 : 50} 
      alignItems="center"
      justifyContent="center"
      gap="$0.5"
    >
      <Text
        color={valueColor}
        fontSize={isWeb ? 18 : 16}
        fontWeight="700"
        fontFamily="$body"
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
