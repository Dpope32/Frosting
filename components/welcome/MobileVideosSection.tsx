import React from 'react';
import { YStack, XStack, H2, Text, isWeb } from 'tamagui';
import { Animated } from 'react-native';
import { OptimizedVideo } from './OptimizedVideo';

interface MobileVideosSectionProps {
  scrollOffset: number;
  descriptionOpacity: Animated.Value;
  descriptionTranslateY: Animated.Value;
}

export const MobileVideosSection = ({ 
  scrollOffset, 
  descriptionOpacity, 
  descriptionTranslateY 
}: MobileVideosSectionProps) => {
  if (!isWeb) return null;

  return (
    <Animated.View
      style={{
        opacity: descriptionOpacity,
        transform: [{ translateY: descriptionTranslateY }],
        width: '100%',
        paddingTop: 60,
      }}
    >
      <YStack alignItems="center" width="100%" paddingBottom="$8">
        <H2>
          Different screen sizes? No problem.
        </H2>
        <Text 
          color="$onboardingLabel" 
          fontSize="$5" 
          textAlign="center" 
          opacity={0.85} 
          lineHeight="$7" 
          maxWidth={600} 
          fontWeight="400" 
          paddingTop="$4"
        >
          Kaiba is designed to work where you do.
        </Text>
      </YStack>

      <YStack alignItems="center" width="100%" paddingBottom="$12" gap="$4">
        <XStack
          width="100%"
          alignItems="center"
          justifyContent="center"
          marginBottom="$6"
          gap={20}
          style={{ display: 'flex', perspective: 1000 }}
        >
          <OptimizedVideo
            src={require('@/assets/videos/mobilehomescreen.mp4')}
            delay={0}
            style={{ 
              width: 180, 
              height: 360, 
              borderRadius: 20, 
              overflow: 'hidden', 
              transform: `rotateY(${-8 + scrollOffset * 0.01}deg) rotateX(2deg)`, 
              boxShadow: '0 12px 35px rgba(74, 222, 205, 0.3), 0 4px 15px rgba(192, 128, 255, 0.2)' 
            }}
          />
          
          <OptimizedVideo
            src={require('@/assets/videos/notesMobile.mp4')}
            delay={200}
            style={{ 
              width: 180, 
              height: 360, 
              borderRadius: 20, 
              overflow: 'hidden', 
              transform: `rotateY(${-3 + scrollOffset * 0.008}deg) rotateX(1deg)`, 
              boxShadow: '0 12px 35px rgba(255, 157, 92, 0.3), 0 4px 15px rgba(100, 149, 237, 0.2)' 
            }}
          />
          
          <OptimizedVideo
            src={require('@/assets/videos/syncmobile.mp4')}
            delay={400}
            style={{ 
              width: 180, 
              height: 360, 
              borderRadius: 20, 
              overflow: 'hidden', 
              transform: `rotateY(${3 + scrollOffset * 0.006}deg) rotateX(-1deg)`, 
              boxShadow: '0 12px 35px rgba(192, 128, 255, 0.3), 0 4px 15px rgba(74, 222, 205, 0.2)' 
            }}
          />
          
          <OptimizedVideo
            src={require('@/assets/videos/habitsAndProjectsMobile.mp4')}
            delay={600}
            style={{ 
              width: 180, 
              height: 360, 
              borderRadius: 20, 
              overflow: 'hidden', 
              transform: `rotateY(${8 + scrollOffset * 0.004}deg) rotateX(-2deg)`, 
              boxShadow: '0 12px 35px rgba(255, 215, 0, 0.3), 0 4px 15px rgba(255, 157, 92, 0.2)' 
            }}
          />
        </XStack>
      </YStack>
    </Animated.View>
  );
}; 