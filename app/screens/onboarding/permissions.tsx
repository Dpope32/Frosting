import React from 'react';
import { YStack, Text, View, isWeb } from 'tamagui';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { cards } from '../../../components/permissions/card'

export default function PermissionsScreen() {
  return (
    <View style={{ flex: 1, backgroundColor: "#000000" }}>
      <YStack gap="$1" padding={isWeb ? "$4" : "$3"} justifyContent="flex-start" alignItems="center" marginTop="$6">
        <Text fontFamily="$heading" fontWeight="600" fontSize="$7" textAlign="center" marginTop="$12" color="#FFFFFF">
          Let's talk permissions
        </Text>
        <Text fontFamily="$body" fontSize="$3" textAlign="center" color="#AAAAAA" marginBottom="$3">
          I know they're annoying, but they are necessary.
        </Text>
      </YStack>
      <YStack gap="$3" paddingHorizontal={24}>
        {cards.map((card) => (
          <YStack key={card.id} height={90} backgroundColor="#1A1A1A" borderRadius="$4" overflow="hidden" position="relative">
            <LinearGradient
              colors={card.gradientColors}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              }}
            />
            <YStack flex={1} flexDirection="row" padding="$4" justifyContent="space-between" alignItems="center">
              <YStack flex={1} justifyContent="center">
                <Text fontFamily="$heading" fontWeight="900" fontSize="$5" color={card.titleColor}>
                  {card.id}. {card.title}
                </Text>
                <Text fontFamily="$body" fontSize="$3" color="#DDDDDD" opacity={0.7} numberOfLines={2}>
                  {card.description}
                </Text>
              </YStack>
              <View width={45} height={45} backgroundColor="rgba(0,0,0,0.2)" borderRadius={22.5} justifyContent="center" alignItems="center">
                <Ionicons name={card.icon} size={24} color={card.iconColor} />
              </View>
            </YStack>
          </YStack>
        ))}
      </YStack>
      <YStack marginTop="auto" marginBottom="$2" paddingHorizontal={24}>
        <View height={50} backgroundColor="#222222" borderRadius="$4" justifyContent="center" alignItems="center">
          <Text fontFamily="$heading" fontSize="$4" fontWeight="600" color="#FFFFFF">
            Continue
          </Text>
        </View>
      </YStack>
    </View>
  );
}