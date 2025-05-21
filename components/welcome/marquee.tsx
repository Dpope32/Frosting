import React from 'react';
import { YStack, XStack, H3, Text, isWeb, View, styled  } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { features } from '@/constants/features';

import { isMobileBrowser } from '@/utils/deviceUtils';

// Component to inject keyframes CSS
export const MarqueeStyles = () => {
  if (!isWeb) return null;
  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes marquee {
        0% { transform: translateX(0%); }
        100% { transform: translateX(-50%); }
      }
      .marquee-content {
        animation: marquee 80s linear infinite;
        will-change: transform;
        animation-play-state: running;
      }
    `}} />
  );
};
export const MarqueeContainer = styled(XStack, {
  name: 'MarqueeContainer',
  overflow: 'hidden',
  width: '100%',
  position: 'relative',
});

export const MarqueeContent = styled(XStack, {
  name: 'MarqueeContent',
  display: 'flex',
  flexDirection: 'row',
  width: '200%',
  gap: '$4',
  className: 'marquee-content',
});


export const Marquee = () => {
  return (
    <MarqueeContainer
      height={isMobileBrowser ? 220 : 240} 
      alignItems="center"
      justifyContent="center"
style={{
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: isMobileBrowser ? 220 : 280,
}}
>
<MarqueeContent
  style={{
    height: isMobileBrowser ? 200 : 250,
    alignItems: 'center',
  }}
>
  {[...features, ...features].map((feature, index) => {
    const bgColor = feature.titleColor + "20";
    const uniqueKey = `${feature.id}-${index}`;
    return (
      <YStack
        key={uniqueKey}
        minWidth={isMobileBrowser ? 320 : 380}
        maxWidth={isMobileBrowser ? 340 : 400}
        height={isMobileBrowser ? 180 : 240} 
        bc={bgColor}
        br="$10"
        overflow="hidden"
        position="relative"
        animation="bouncy"
        justifyContent="flex-start"
        px="$4"
        py="$3"
        style={{ boxShadow: isWeb ? '0 2px 16px #0002' : undefined }}
      >

        <XStack alignItems="center" justifyContent="center" gap="$3" mb="$2" mt="$2" position="relative">
          <View
            width={32}
            height={32}
            backgroundColor="rgba(0,0,0,0.10)"
            br={16}
            justifyContent="center"
            alignItems="center"
            style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)' }}
          >
            <Ionicons name={feature.icon} size={20} color={feature.iconColor} />
          </View>
          <H3
            fontFamily="$heading"
            fontWeight="800"
            fontSize={isMobileBrowser ? "$6" : "$7"} 
            color={feature.titleColor}
            marginBottom={0}
            marginTop={0}
            textAlign="center"
            width="100%"
            style={{
              marginLeft: 32, 
            }}
          >
            {feature.title}
          </H3>
        </XStack>
        <XStack flex={1} padding={0} justifyContent="space-between" alignItems="flex-start">
          <YStack flex={1} justifyContent="center" pr="$2">
            <YStack gap="$2" marginBottom={12}>
              {feature.items.map((item, i) => (
                <XStack key={i} alignItems="flex-start" gap="$2" flexShrink={1}>
                  <Text fontFamily="$body" color={feature.iconColor} mt={1} fontSize="$5">•</Text>
                  <Text
                    fontFamily="$body"
                    fontSize={isMobileBrowser ? "$4" : "$5"}
                    color="$onboardingLabel"
                    flex={1}
                    whiteSpace="normal"
                  >{item}</Text>
                </XStack>
              ))}
            </YStack>
            <View height={24} />
          </YStack>
        </XStack>
      </YStack>
    );
  })}
</MarqueeContent>
</MarqueeContainer>
  );
};
