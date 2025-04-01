import React, { useState, useEffect, useRef } from 'react';
import {  YStack, XStack,  H1,  H2,  H3, Text, Image, isWeb, ScrollView, Card, View } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';

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
      id: 1,
      title: "Privacy First",
      items: [
        "Your data stays safe and private",
        "Stored directly on your device",
        "No server data collection"
      ],
      titleColor: "#C080FF",
      icon: "shield-checkmark-outline" as any,
      iconColor: "#C080FF"
    },
    {
      id: 2,
      title: "Task Management",
      items: [
        "Track recurring tasks",
        "Manage one-time todos",
        "Stay organized"
      ],
      titleColor: "#6495ED",
      icon: "list-outline" as any,
      iconColor: "#6495ED"
    },
    {
      id: 3,
      title: "Calendar",
      items: [
        "Track birthdays & events",
        "NBA schedules",
        "Bill reminders"
      ],
      titleColor: "#4ADECD",
      icon: "calendar-outline" as any,
      iconColor: "#4ADECD"
    },
    {
      id: 4,
      title: "Finance Tracking",
      items: [
        "Monitor portfolio",
        "Real-time stock updates",
        "Financial insights"
      ],
      titleColor: "#FF9D5C",
      icon: "stats-chart-outline" as any,
      iconColor: "#FF9D5C"
    }
  ];

  const webBackgroundStyle = isWeb ? {
    backgroundImage: [
      'radial-gradient(circle at 15% 25%, rgba(192, 128, 255, 0.25) 0%, transparent 40%)',
      'radial-gradient(circle at 85% 75%, rgba(74, 222, 205, 0.15) 0%, transparent 35%)',
      'radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.05) 0%, transparent 30%)',
      'linear-gradient(135deg, transparent 40%, rgba(255, 215, 0, 0.08) 50%, transparent 60%)',
      'linear-gradient(45deg, transparent 45%, rgba(200, 200, 255, 0.06) 50%, transparent 55%)',
      'linear-gradient(160deg, #161A30 0%, #272A4F 50%, #05050A 100%)'
    ].join(', '),
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed'
  } : {};

  const combinedContentContainerStyle = {
    flexGrow: 1,
    ...webBackgroundStyle
  };

  return (
    <ScrollView contentContainerStyle={combinedContentContainerStyle}>
      <YStack flex={1} padding="$4" gap="$4" maxWidth={1200} marginHorizontal="auto" position="relative" zi={1}>
        <YStack alignItems="center" gap="$5" marginVertical="$8">
          <XStack position="relative" alignItems="center">
            {isWeb && (
              <Image
                source={require('@/assets/images/icon.png')}
                style={[iconStyle, { position: 'absolute', left: -150, top: -20 }]}
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
          </XStack>
          
          <H2 
            color="$onboardingLabel" 
            fontFamily="$heading" 
            fontSize={isWeb ? "$8" : "$6"} 
            fontWeight="500"
            opacity={0.8}
            pt={isWeb ? "$1" : "$0"}
          >
            Your world, all in one place
          </H2>
        </YStack>

        <XStack flexWrap="wrap" justifyContent="center" gap="$4" marginBottom="$4">
          {features.map((feature) => {
            if (isWeb) {
              const bgColor = feature.titleColor + "20";
              return (
                <YStack
                  key={feature.id}
                  width="45%"
                  minWidth={300}
                  height={150}
                  bc={bgColor}
                  br="$4"
                  overflow="hidden"
                  position="relative"
                  marginBottom="$4"
                >
                  <XStack flex={1} padding="$4" justifyContent="space-between" alignItems="center">
                    <YStack flex={1} justifyContent="center">
                      <H3
                        fontFamily="$heading"
                        fontWeight="600"
                        fontSize="$5"
                        color={feature.titleColor}
                        marginBottom="$2"
                      >
                        {feature.title}
                      </H3>
                      <YStack gap="$1.5" marginBottom="$3">
                        {feature.items.map((item, i) => (
                          <XStack key={i} alignItems="flex-start" gap="$2">
                            <Text fontFamily="$body" color={feature.iconColor} mt={1}>•</Text>
                            <Text fontFamily="$body" fontSize="$3" color="$onboardingLabel" flex={1}>{item}</Text>
                          </XStack>
                        ))}
                      </YStack>
                    </YStack>
                    <View
                      width={50}
                      height={50}
                      backgroundColor="rgba(0,0,0,0.2)"
                      br={25}
                      justifyContent="center"
                      alignItems="center"
                      marginLeft="$3"
                    >
                      <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                    </View>
                  </XStack>
                </YStack>
              );
            } else {
              return (
                <Card
                  key={feature.id}
                  width="100%" 
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
                  <YStack gap="$2" marginBottom="$3">
                    {feature.items.map((item, i) => (
                      <XStack key={i} alignItems="center" gap="$2">
                        <Text fontFamily="$body" color="$onboardingButtonSecondaryText">•</Text>
                        <Text fontFamily="$body" color="$onboardingLabel">{item}</Text>
                      </XStack>
                    ))}
                  </YStack>
                </Card>
              );
            }
          })}
        </XStack>

      </YStack>
    </ScrollView>
  );
}
