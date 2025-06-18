// src/utils/ClockCard.tsx
import { Stack, Text, isWeb } from 'tamagui';
import React, { useEffect, useState } from 'react';
import { isIpad } from '@/utils';

interface ClockCardProps {
  isHome?: boolean;
  isDark?: boolean;
}

export function ClockCard({ isHome, isDark }: ClockCardProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric',
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <Stack
      backgroundColor={isHome ? 'transparent' : isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)"}
      br={isIpad() ? 18 : 12}
      padding="$3"
      borderWidth={isHome ? 0 : 1}
      borderColor={isHome ? 'transparent' : "rgba(255, 255, 255, 0.3)"}
      minWidth={70}
      height={isWeb ? 60 : isIpad() ? 60 : 48}
      alignItems="center"
      justifyContent="center"
      gap="$0.5"
      hoverStyle={{ 
        backgroundColor: "rgba(0, 0, 0, 0.4)",
        transform: [{ scale: 1.02 }],
        shadowColor: "#dbd0c6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
      pressStyle={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
    >
      <Text
        color="#dbd0c6"
        fontSize={isWeb ? 18 : isIpad() ? 18 : 16}
        fontWeight="700"
        fontFamily="$body"
        textAlign="center"
        numberOfLines={1}
      >
        {formatTime(time)}
      </Text>
    </Stack>
  );
}