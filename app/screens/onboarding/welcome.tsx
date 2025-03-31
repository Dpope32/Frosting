import React, { useState, useEffect, useRef } from 'react';
import { YStack, H1, Text, Button, Image, isWeb, XStack } from 'tamagui';

export default function WelcomeScreen({ onComplete }: { onComplete: () => void }) {
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
          <H1 textAlign="center" color="$onboardingLabel" fontFamily="$heading" fontSize={isWeb ? "$10" : "$8"}>
            Kaiba Nexus
          </H1>
          {isWeb && (
            <Image
              source={require('@/assets/images/icon.png')}
              style={[iconStyle, { position: 'absolute', left: -90 }]}
            />
          )}
        </XStack>

        <YStack gap="$3" alignSelf="stretch" paddingHorizontal="$4">
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Your data stays safe and private, stored directly on your device right here in your browser.
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               We don't use servers to collect your personal information.
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               A feature-rich personal dashboard app built with React Native and Expo
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Task Management: Track recurring and one-time tasks
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Calendar: Track birthdays, bills, events, and NBA schedules
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               CRM: Manage contacts with payment methods, addresses, etc.
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Password Vault: Securely store passwords locally
             </Text>
           </XStack>
           <XStack gap="$3" alignItems="center">
             <Text color="$onboardingButtonSecondaryText" fontSize="$5" marginTop={0}>•</Text>
             <Text flex={1} color="$onboardingLabel" fontFamily="$body" fontSize={isWeb ? "$6" : "$5"} fontWeight="400" lineHeight="$5">
               Finance Tracking: Monitor portfolio with real-time stock updates
             </Text>
           </XStack>
        </YStack>

        {isWeb && (
          <Image
            source={require('@/assets/screenshots/HomeScreenWebLoaded.png')}
            style={{ width: '100%', maxWidth: 800, borderRadius: 12, marginVertical: 20 }}
            resizeMode="contain"
          />
        )}
      </YStack>

      <Button
        size="$5"
        onPress={onComplete}
        backgroundColor="$onboardingWelcomeButtonBackground"
        color="$onboardingWelcomeButtonText"
        width="100%"
        maxWidth={300}
        alignSelf="center"
        fontFamily="$heading"
        fontWeight="600"
      >
        Continue
      </Button>
    </YStack>
  );
}
