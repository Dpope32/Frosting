import React from 'react';
import { YStack, Text, View, isWeb, Button } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { cards } from '../../../components/permissions/card';

export default function PermissionsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <YStack gap="$2" padding={isWeb ? "$6" : "$4"} justifyContent="flex-start" alignItems="center" mt={isWeb ? "$10" : "$6"}>
        <Text fontFamily="$heading" fontWeight="600" fontSize={isWeb ? "$9" : "$7"} textAlign="center" color="#FFFFFF">
          Let's talk permissions
        </Text>
        <Text fontFamily="$body" fontSize="$3" textAlign="center" color="#AAAAAA" marginBottom="$4">
          I know they're annoying, but they are necessary.
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
                  <Text fontFamily="$body" fontSize="$3" color="#FFFFFF" opacity={0.8} numberOfLines={2} mt="$1">
                    {card.description}
                  </Text>
                </YStack>
                <View 
                  width={50} 
                  height={50} 
                  backgroundColor="rgba(0,0,0,0.2)" 
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
        <Text fontFamily="$body" fontSize="$3" textAlign="center" color="#AAAAAA" marginBottom="$3">
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