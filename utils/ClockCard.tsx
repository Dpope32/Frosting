import React, { useEffect, useState } from 'react';
import { Stack, Text } from 'tamagui';

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
      paddingHorizontal="$3"
      paddingVertical="$2"
    >
      <Text
        fontFamily="$SpaceMono"
        fontSize={18}
        color="#dbd0c6"
        fontWeight="bold"
        style={{
          textShadowColor: 'rgba(0, 0, 0, 0.5)',
          textShadowOffset: { width: 1, height: 1 },
          textShadowRadius: 3,
        }}
      >
        {formatTime(time)}
      </Text>
    </Stack>
  );
}
