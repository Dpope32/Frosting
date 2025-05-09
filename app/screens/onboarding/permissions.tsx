import React from 'react';
import { YStack, Text, View, isWeb, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { cards } from '../../../components/permissions/card';

interface PermissionsScreenProps {
  isDark?: boolean;
}

export default function PermissionsScreen({ isDark = true }: PermissionsScreenProps) {
  return (
    <View style={{ flex: 1, backgroundColor: isDark ? "#010101" : "#f2f2f2" }}>
      <YStack gap="$3" padding={isWeb ? "$6" : "$4"} pt={isWeb ? "$6" : "$12"} justifyContent="flex-start" alignItems="center" mt={isWeb ? "$10" : "$6"}>
      <Text fontFamily="$heading" fontWeight="800" fontSize={isWeb ? "$10" : "$9"} textAlign="center" color={isDark ? "rgba(255, 255, 255, 0.85)" : "rgba(0, 0, 0, 0.85)"}>
          Welcome to Kaiba!
        </Text>
        <Text fontFamily="$heading" fontWeight="600" fontSize={isWeb ? "$8" : "$7"} textAlign="center" color={isDark ? "rgba(191, 191, 191, 0.85)" : "rgba(80, 80, 80, 0.85)"}>
          Let's talk permissions..
        </Text>
      </YStack>
      
      <YStack gap="$4" px={isWeb ? 36 : 24} width="100%" maxWidth={isWeb ? 600 : "100%"} alignSelf="center">
        {cards.map((card) => {
          const bgColor = card.titleColor + "20";
          
          return (
            <YStack 
              key={card.id} 
              height={isWeb ? 100 : 90} 
              bc={bgColor}
              br="$4" 
              overflow="hidden" 
              position="relative"
            >
              <YStack flex={1} flexDirection="row" padding="$4" justifyContent="space-between" alignItems="center">
                <YStack flex={1} justifyContent="center">
                  <Text fontFamily="$heading" fontWeight="600" fontSize={isWeb ? "$5" : "$4"} color={card.titleColor}>
                    {card.id}. {card.title}
                  </Text>
                  <Text fontFamily="$body" fontSize="$3" color={isDark ? "#FFFFFF" : "#333333"} opacity={0.8} numberOfLines={2} mt="$1">
                    {card.description}
                  </Text>
                </YStack>
                <View 
                  width={50} 
                  height={50} 
                  backgroundColor={isDark ? "rgba(0,0,0,0.2)" : "rgba(255,255,255,0.2)"} 
                  br={25} 
                  justifyContent="center" 
                  alignItems="center"
                  marginLeft="$2"
                >
                  <Ionicons name={card.icon} size={28} color={card.iconColor} />
                </View>
              </YStack>
            </YStack>
          );
        })}
      </YStack>
      
      <YStack mt="auto" marginBottom={isWeb ? "$6" : "$4"} px={isWeb ? 36 : 24} width="100%" maxWidth={isWeb ? 600 : "100%"} alignSelf="center">
        <Text fontFamily="$body" fontSize="$3" textAlign="center" color={isDark ? "#AAAAAA" : "#666666"} marginBottom={isWeb ? "$3" : "$8"}>
          Just click continue to go to the next step!
        </Text>
        <Button
          height={isWeb ? 56 : 50} 
          backgroundColor="#222222" 
          br="$4" 
          justifyContent="center" 
          alignItems="center"
          hoverStyle={{ backgroundColor: "#333333" }}
          pressStyle={{ backgroundColor: "#444444" }}
        >
          <Text fontFamily="$heading" fontSize="$4" fontWeight="600" color="#FFFFFF">
            Continue
          </Text>
        </Button>
      </YStack>
    </View>
  );
}
