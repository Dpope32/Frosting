import React, { useState, useEffect, useRef } from 'react';
import { YStack, isWeb, ScrollView, XStack } from 'tamagui';
import { Animated } from 'react-native';
import { Marquee, MarqueeStyles } from '@/components/welcome/marquee';
import { SyncSection } from '@/components/welcome/syncSection';
import { HeroSection } from '@/components/welcome/HeroSection';
import { MobileVideosSection } from '@/components/welcome/MobileVideosSection';
import { DesktopVideosSection } from '@/components/welcome/DesktopVideosSection';
import { FloatingContinueButton } from '@/components/welcome/FloatingContinueButton';
import { MobileFeaturesSection } from '@/components/welcome/MobileFeaturesSection';
import { IPad } from '@/components/welcome/iPad';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [showContinueButton, setShowContinueButton] = useState(false);
  const descriptionTranslateY = useRef(new Animated.Value(50)).current;
  const syncSectionTranslateY = useRef(new Animated.Value(50)).current;
  const animationStates = useRef({ description: false, sync: false });

  const getDynamicBackground = (scrollY: number) => {
    const progress = Math.min(scrollY / 2000, 1);
    
    return {
      backgroundImage: [
        `radial-gradient(circle at ${20 + progress * 30}% ${30 + progress * 20}%, hsla(220, 70%, 60%, ${0.15 + progress * 0.1}) 0%, transparent 40%)`,
        `radial-gradient(circle at ${80 - progress * 20}% ${70 - progress * 10}%, hsla(210, 60%, 50%, ${0.1 + progress * 0.05}) 0%, transparent 35%)`,
        `radial-gradient(circle at 50% 50%, hsla(215, 50%, 45%, ${0.08 + progress * 0.04}) 0%, transparent 30%)`,
        `linear-gradient(${135 + progress * 90}deg,rgb(6, 16, 22) 0%, rgb(15, 25, 35) 50%,rgb(10, 20, 30) 100%)`
      ].join(', '),
      backgroundSize: `${100 + progress * 20}% ${100 + progress * 20}%`,
      backgroundPosition: `${progress * 20}% ${progress * 15}%`,
      backgroundAttachment: 'fixed',  
    };
  };

  useEffect(() => {
    if (!isWeb) return;

    const listener = scrollY.addListener(({ value }) => {
      setScrollOffset(value);
      setShowContinueButton(value > 300);
      
      if (value > 600 && !animationStates.current.description) {
        animationStates.current.description = true;
        Animated.timing(descriptionTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
      
      if (value > 1400 && !animationStates.current.sync) {
        animationStates.current.sync = true;
        Animated.timing(syncSectionTranslateY, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }).start();
      }
    });

    return () => {
      scrollY.removeListener(listener);
    };
  }, [scrollY, descriptionTranslateY, syncSectionTranslateY]);

  const combinedContentContainerStyle = {
    flexGrow: 1,
    paddingVertical: isWeb ? 40 : 40, 
    paddingHorizontal: 20,
    ...(isWeb ? getDynamicBackground(scrollOffset) : {})
  };

  return (
    <>
      <ScrollView 
        contentContainerStyle={combinedContentContainerStyle}
        onScroll={isWeb ? Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        ) : undefined}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {isWeb && <MarqueeStyles />}
        
        <YStack
          flex={1}
          gap="$2"
          width="100%"
          position="relative"
          zi={1} 
          minHeight="100vh"
          justifyContent="flex-start"
          alignItems="center"
          paddingTop="$20"
        >
          <HeroSection 
            scrollOffset={scrollOffset} 
            onComplete={onComplete} 
          />
          
          {isWeb && (
            <YStack width="100%" alignItems="center" paddingTop="$3">
              <Marquee/>
            </YStack>
          )}

          {isWeb ? (
            <Animated.View
              style={{
                transform: [{ translateY: syncSectionTranslateY }],
                width: '100%',
                paddingTop: 40,
                paddingBottom: 40,
              }}
            >
              <YStack alignItems="center" width="100%">
                <SyncSection />
              </YStack>
            </Animated.View>
          ) : (
            <MobileFeaturesSection />
          )}

     {isWeb && (
            <XStack 
              width="100%" 
              alignItems="flex-start" 
              justifyContent="space-between"
              gap="$4"
              paddingTop="$2"
              paddingBottom="$8"
            >
              <YStack flex={1} alignItems="center">
                <DesktopVideosSection
                  scrollOffset={scrollOffset}
                  syncSectionTranslateY={syncSectionTranslateY}
                />
              </YStack>
              <YStack flex={1} alignItems="center">
                <MobileVideosSection
                  scrollOffset={scrollOffset}
                  descriptionTranslateY={descriptionTranslateY}
                />
              </YStack>
              <YStack flex={1} alignItems="center">
                <IPad 
                  scrollOffset={scrollOffset}
                  syncSectionTranslateY={syncSectionTranslateY}
                />
              </YStack>
            </XStack>
          )}
        </YStack>
      </ScrollView>   

      <FloatingContinueButton
        showContinueButton={showContinueButton}
        scrollOffset={scrollOffset}
        onComplete={onComplete}
      />
    </>
  );
}