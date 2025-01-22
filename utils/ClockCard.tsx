// src/utils/ClockCard.tsx
import { Stack, Text } from 'tamagui';
import React, { useEffect, useState } from 'react';

export function ClockCard() {
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
        color="#F44336"
        fontSize={11}
        opacity={0.9}
        marginBottom="$0.5"
      >
        Time
      </Text>
      <Text
        color="white"
        fontSize={14}
        fontWeight="bold"
      >
        {formatTime(time)}
      </Text>
    </Stack>
  );
}