import React, { useEffect, useState, useCallback } from 'react';
import { isWeb, Stack, Text } from 'tamagui';
import { getValueColor } from '@/constants';
import { usePortfolioQuery, usePortfolioStore } from '@/store';
import { StorageUtils } from '@/store/AsyncStorage';
import { isIpad } from '@/utils';
import { debounce } from 'lodash';

interface PortfolioCardProps {
  roundToWholeNumber?: boolean;
  isHome?: boolean;
  isDark?: boolean;
  onPress?: () => void;
}

export function PortfolioCard({ roundToWholeNumber = false, isHome, isDark, onPress }: PortfolioCardProps) {
  const { isLoading, refetch } = usePortfolioQuery();
  const totalValue = usePortfolioStore((state) => state.totalValue);
  const [lastUpdate, setLastUpdate] = useState<string | null>(null);
  

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
  }, [totalValue]); 

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
        minimumFractionDigits: roundToWholeNumber ? 0 : 0, 
        maximumFractionDigits: roundToWholeNumber ? 0 : 0,
        notation: 'compact',
        compactDisplay: 'short'
      })}`
    : '$0.00';

  const valueColor = getValueColor('portfolio', totalValue ?? 0, '', isDark ?? false);

  const debouncedPress = useCallback(
    debounce(() => {
      console.log(`💰 PORTFOLIO CARD: onPress called at ${Date.now()}`);
      if (onPress) {
        onPress();
      }
    }, 300, {
      leading: true,
      trailing: false
    }),
    [onPress]
  );

  const handlePress = () => {
    debouncedPress();
  };

  return (
    <Stack
      onPress={handlePress}
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12}
      padding="$3"
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.3)"}
      minWidth={75}
      height={isWeb ? 60 : isIpad() ? 60 : 48} 
      alignItems="center"
      justifyContent="center"
      gap="$0.5"
      {...(isWeb && {
        hoverStyle: { 
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          transform: [{ scale: 1.02 }],
          shadowColor: "#dbd0c6",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
        }
      })}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <Text
        color={valueColor}
        fontSize={isWeb ? 18 : isIpad() ? 18 : 16}
        fontWeight="700"
        fontFamily="$body"
        textAlign="center"
        numberOfLines={1}
      >
        {displayValue}
      </Text>
    </Stack>
  );
}