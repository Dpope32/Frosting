import React from 'react';
import { YStack, H1, Text, View, isWeb, Button } from 'tamagui';
import { Dimensions } from 'react-native';
import { TypingAnimation } from './TypingAnimation';

interface HeroSectionProps {
  scrollOffset: number;
  onComplete: () => void;
}

export const HeroSection = ({ scrollOffset, onComplete }: HeroSectionProps) => {
  const screenWidth = Dimensions.get('window').width;
  const isMobileBrowser = isWeb && screenWidth <= 768;
  
  const typingTexts = [
    "calendar",
    "tasks", 
    "passwords",
    "habits",
    "notes",
    "projects",
    "weather",
    "stocks",
    "crypto",
    "events",
    "birthday reminders",
  ];

  return (
    <YStack alignItems="center" gap="$8" width="100%" position="relative" zi={1}>
      <YStack alignItems="center" gap="$4" paddingVertical="$2" maxWidth={1400} marginHorizontal="auto" position="relative">
        {isWeb && (
          <>
            <View
              position="absolute"
              top={-60}
              left={-80}
              width={340}
              height={340}
              style={{
                zIndex: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at 60% 40%, rgba(192, 128, 255, ${0.3 + Math.sin(scrollOffset * 0.001) * 0.1}) 0%, transparent 70%)`,
                filter: 'blur(24px)',
              }}
            />
            <View
              position="absolute"
              top={-40}
              right={-100}
              width={260}
              height={260}
              style={{
                zIndex: 0,
                pointerEvents: 'none',
                background: `radial-gradient(circle at 40% 60%, rgba(74, 222, 205, ${0.2 + Math.cos(scrollOffset * 0.0015) * 0.1}) 0%, transparent 70%)`,
                filter: 'blur(18px)',
              }}
            />
          </>
        )}

<H1
              color="$onboardingLabel"
              fontFamily="$heading"
              fontSize={isWeb ? (isMobileBrowser ? "$9" : screenWidth * 0.07) : "$8"}
              fontWeight="500"
              textAlign="center"
              style={{
                background: isWeb ? 'linear-gradient(90deg,rgb(0, 204, 255) 20%, rgb(0, 255, 225) 30%,rgb(0, 255, 225) 50%,rgb(183, 0, 255) 90%)' : undefined,
                WebkitBackgroundClip: isWeb ? 'text' : undefined,
                backgroundClip: isWeb ? 'text' : undefined,
                WebkitTextFillColor: isWeb ? 'transparent' : undefined,
                color: isWeb ? 'transparent' : '$onboardingLabel',
                letterSpacing: '-0.02em',
                maxWidth: '100%',
                overflow: 'visible',
                lineHeight: 1.2,
                minHeight: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              Kaiba
            </H1>
      </YStack>

      <YStack alignItems="center" maxWidth={650}>
        <TypingAnimation texts={typingTexts} speed={80} deleteSpeed={50} pauseTime={2000} />
        <Text 
          color="$onboardingLabel" 
          fontSize="$6" 
          textAlign="center" 
          opacity={0.8}
          lineHeight="$7"
          fontWeight="400"
          paddingTop="$2"
        >
          across all your devices with military-grade encryption.
        </Text>
      </YStack>

      {isWeb && (
        <Button
          size="$6"
          backgroundColor="$blue10"
          color="white"
          fontWeight="700"
          borderRadius="$8"
          paddingHorizontal="$20"
          marginLeft={20}
          paddingVertical="$5"
          onPress={onComplete}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          style={{
            boxShadow: isWeb ? `0 12px 40px rgba(59, 130, 246, ${0.4 + scrollOffset * 0.0001})` : undefined,
            cursor: 'pointer',
            transform: isWeb ? `scale(${1 + Math.sin(scrollOffset * 0.003) * 0.02})` : undefined,
          }}
        >
          <Text fontSize="$5" fontWeight="700" color="white" letterSpacing={0.5}>
            Continue
          </Text>
        </Button>
      )}
    </YStack>
  );
}; 