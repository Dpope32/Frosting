import React, { useState, useEffect, useRef } from 'react';
import { 
  YStack, 
  XStack, 
  H1, 
  H2, 
  H3, 
  Text, 
  Button, 
  Image, 
  isWeb, 
  Separator, 
  ScrollView,
  Card,
  Paragraph
} from 'tamagui';

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
    width: 90,
    height: 90,
    borderRadius: 45,
    transform: isWeb ? [{ rotate: `${rotation}deg` }] : [],
  };

  const features = [
    {
      title: "Privacy First",
      items: [
        "Your data stays safe and private",
        "Stored directly on your device",
        "No server data collection"
      ]
    },
    {
      title: "Task Management",
      items: [
        "Track recurring tasks",
        "Manage one-time todos",
        "Stay organized"
      ]
    },
    {
      title: "Calendar",
      items: [
        "Track birthdays & events",
        "NBA schedules",
        "Bill reminders"
      ]
    },
    {
      title: "Finance Tracking",
      items: [
        "Monitor portfolio",
        "Real-time stock updates",
        "Financial insights"
      ]
    }
  ];

  return (
    <ScrollView>
      <YStack flex={1} padding="$4" gap="$4" maxWidth={1200} marginHorizontal="auto">
        <YStack alignItems="center" gap="$5" marginVertical="$8">
          <XStack position="relative" alignItems="center">
            {isWeb && (
              <Image
                source={require('@/assets/images/icon.png')}
                style={[iconStyle, { position: 'absolute', left: -150 }]}
              />
            )}
            <H1 
              color="$onboardingLabel" 
              fontFamily="$heading" 
              fontSize={isWeb ? "$12" : "$9"}
              letterSpacing={1}
            >
              Kaiba Nexus
            </H1>
            {isWeb && (
              <Image
                source={require('@/assets/images/icon.png')}
                style={[iconStyle, { position: 'absolute', right: -150 }]}
              />
            )}
          </XStack>
          
          <H2 
            color="$onboardingLabel" 
            fontFamily="$heading" 
            fontSize={isWeb ? "$8" : "$6"} 
            fontWeight="500"
            opacity={0.8}
            pt={isWeb ? "$5" : "$0"}
          >
            Your world, all in one place
          </H2>
        </YStack>

        <XStack flexWrap="wrap" justifyContent="center" gap="$4" marginBottom="$4">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              width={isWeb ? "45%" : "100%"} 
              minWidth={300}
              padding="$4"
              marginBottom="$4"
              backgroundColor="$onboardingCardBackground"
              borderColor="$onboardingCardBorder"
              borderWidth={1}
            >
              <H3 
                color="$onboardingLabel" 
                fontFamily="$heading" 
                fontSize="$6"
                marginBottom="$3"
              >
                {feature.title}
              </H3>
              <YStack gap="$2">
                {feature.items.map((item, i) => (
                  <XStack key={i} alignItems="center" space="$2">
                    <Text fontFamily="$body" color="$onboardingButtonSecondaryText">•</Text>
                    <Text fontFamily="$body" color="$onboardingLabel">{item}</Text>
                  </XStack>
                ))}
              </YStack>
            </Card>
          ))}
        </XStack>

      </YStack>
    </ScrollView>
  );
}
