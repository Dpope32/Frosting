import React, { useState, useEffect, useRef } from 'react';
import { YStack, H1, Text, Button, Image, isWeb, XStack } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme'; 

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
  const colorScheme = useColorScheme(); 
  const isDark = colorScheme === 'dark'; 
  const textColor = isDark ? '$gray12Dark' : '$gray12Light';
  const bulletColor = isDark ? '$gray11Dark' : '$gray11Light'; 
  const buttonTextColor = isDark ? '$gray1Dark' : '$gray1Light'; 
  const buttonBackgroundColor = isDark ? '$blue9Dark' : '$blue9Light';

  const [rotation, setRotation] = useState(0);
  const targetRotation = useRef(0);
  const animationRef = useRef<number>();
  const screenCenter = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!isWeb) return;

    const animate = () => {
      setRotation(prev => {
        const diff = targetRotation.current - prev;
        return prev + diff * 0.1;
      });
      animationRef.current = requestAnimationFrame(animate);
    };
    animationRef.current = requestAnimationFrame(animate);

    const updateScreenCenter = () => {
      screenCenter.current = {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      };
    };
    updateScreenCenter();
    window.addEventListener('resize', updateScreenCenter);

    const handleMouseMove = (event: MouseEvent) => {
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const deltaX = mouseX - screenCenter.current.x;
      const deltaY = mouseY - screenCenter.current.y;
      targetRotation.current = Math.atan2(deltaY, deltaX) * (180 / Math.PI);
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', updateScreenCenter);
    };
  }, []);

  const iconStyle = {
    width: 80,
    height: 80,
    transform: isWeb ? [{ rotate: `${rotation}deg` }] : [], 
  };

  return (
    <YStack flex={1} justifyContent="space-between" alignItems="center" padding="$6" paddingTop="$16" gap="$5">
      <YStack alignItems="center" gap="$6" width="100%" maxWidth={600}>
        <XStack position="relative" width="100%" justifyContent="center">
          <H1 textAlign="center" color={textColor} fontFamily="$heading" fontSize={isWeb ? "$10" : "$8"}>
            Kaiba Nexus
          </H1>
          {isWeb && (
            <Image
              source={require('@/assets/images/icon.png')}
              // @ts-ignore - Tamagui types might not fully cover RNW style props
              style={[iconStyle, { position: 'absolute', left: -90 }]}
            />
          )}
        </XStack>

        {/* Bullet Points */}
        <YStack gap="$3" alignSelf="stretch" paddingHorizontal="$4">
           <XStack gap="$3" alignItems="center">
             <Text color={bulletColor} fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color={textColor} fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Your data stays safe and private, stored directly on your device right here in your browser.
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color={bulletColor} fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color={textColor} fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               We don't use servers to collect your personal information.
             </Text>
           </XStack>
        </YStack>
      </YStack>

      {/* Continue Button */}
      <Button
        size="$5"
        onPress={onComplete}
        backgroundColor={buttonBackgroundColor}
        color={buttonTextColor}
        width="100%"
        maxWidth={300}
        alignSelf="center"
        fontFamily="$heading"
        fontWeight="600"
        // marginBottom="$4" // Removed default bottom margin, rely on main YStack gap
      >
        Continue
      </Button>
    </YStack>
  );
}
