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
  Paragraph,
  View // Added View for icon background
} from 'tamagui';
import { Ionicons } from '@expo/vector-icons'; // Import Ionicons

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

  // Updated features array with icon and color info based on permissions/card.tsx
  const features = [
    {
      id: 1, // Added id for consistency
      title: "Privacy First",
      items: [
        "Your data stays safe and private",
        "Stored directly on your device",
        "No server data collection"
      ],
      titleColor: "#C080FF", // From Contacts card
      icon: "shield-checkmark-outline" as any, // Using a relevant icon
      iconColor: "#C080FF"
    },
    {
      id: 2, // Added id
      title: "Task Management",
      items: [
        "Track recurring tasks",
        "Manage one-time todos",
        "Stay organized"
      ],
      titleColor: "#6495ED", // From Notifications card
      icon: "list-outline" as any, // Using a relevant icon
      iconColor: "#6495ED"
    },
    {
      id: 3, // Added id
      title: "Calendar",
      items: [
        "Track birthdays & events",
        "NBA schedules",
        "Bill reminders"
      ],
      titleColor: "#4ADECD", // From Calendar card
      icon: "calendar-outline" as any, // Using a relevant icon
      iconColor: "#4ADECD"
    },
    {
      id: 4, // Added id
      title: "Finance Tracking",
      items: [
        "Monitor portfolio",
        "Real-time stock updates",
        "Financial insights"
      ],
      titleColor: "#FF9D5C", // From Photo Library card (placeholder)
      icon: "stats-chart-outline" as any, // Using a relevant icon
      iconColor: "#FF9D5C"
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
          {features.map((feature) => {
            // Logic for web styling based on permissions/card.tsx
            if (isWeb) {
              const bgColor = feature.titleColor + "20"; // Background color with transparency
              return (
                <YStack 
                  key={feature.id} 
                  width="45%" 
                  minWidth={300}
                  height={150} // Adjusted height for content
                  bc={bgColor}
                  br="$4" 
                  overflow="hidden" 
                  position="relative"
                  marginBottom="$4" // Keep margin bottom
                >
                  <XStack flex={1} padding="$4" justifyContent="space-between" alignItems="center">
                    <YStack flex={1} justifyContent="center">
                      <H3 
                        fontFamily="$heading" 
                        fontWeight="600" 
                        fontSize="$5" // Adjusted font size
                        color={feature.titleColor}
                        marginBottom="$2" // Reduced margin
                      >
                        {feature.title}
                      </H3>
                      <YStack gap="$1.5" marginBottom="$3"> {/* Added marginBottom here */}
                        {feature.items.map((item, i) => (
                          <XStack key={i} alignItems="flex-start" space="$2">
                            <Text fontFamily="$body" color={feature.iconColor} mt={1}>•</Text>
                            <Text fontFamily="$body" fontSize="$3" color="$onboardingLabel" flex={1}>{item}</Text>
                          </XStack>
                        ))}
                      </YStack>
                    </YStack>
                    <View 
                      width={50} 
                      height={50} 
                      backgroundColor="rgba(0,0,0,0.2)" // Consistent dark background for icon circle
                      br={25} 
                      justifyContent="center" 
                      alignItems="center"
                      marginLeft="$3" // Increased margin
                    >
                      <Ionicons name={feature.icon} size={28} color={feature.iconColor} />
                    </View>
                  </XStack>
                </YStack>
              );
            } else {
              // Original Card rendering for non-web platforms
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
                  <YStack gap="$2" marginBottom="$3"> {/* Added marginBottom here */}
                    {feature.items.map((item, i) => (
                      <XStack key={i} alignItems="center" space="$2">
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
