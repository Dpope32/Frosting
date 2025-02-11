import React, { useEffect, useState, useMemo, memo } from 'react';
import { Stack, Text } from 'tamagui';

// Move this outside to prevent recreating on every render
const timeFormatOptions = {
  hour: 'numeric',
  minute: '2-digit',
  hour12: true 
} as const;

// Memoize the style object
const textStyle = {
  textShadowColor: 'rgba(0, 0, 0, 0.5)',
  textShadowOffset: { width: 1, height: 1 },
  textShadowRadius: 3,
} as const;

// Memoize the entire card
export const ClockCard = memo(() => {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    // Only update when minutes change
    const timer = setInterval(() => {
      const now = new Date();
      if (now.getSeconds() === 0 || !time) {
        setTime(now);
      }
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  // Memoize the formatted time
  const formattedTime = useMemo(() => 
    time.toLocaleTimeString('en-US', timeFormatOptions),
    [time]
  );

  return (
    <Stack
      backgroundColor="rgba(0, 0, 0, 0.3)"
      borderRadius={8}
      paddingHorizontal="$2"
      paddingVertical="$2"
      marginRight={10}
    >
      <Text
        fontFamily="$body"
        fontSize={18}
        color="#dbd0c6"
        fontWeight="bold"
        style={textStyle}
      >
        {formattedTime}
      </Text>
    </Stack>
  );
});

ClockCard.displayName = 'ClockCard';
