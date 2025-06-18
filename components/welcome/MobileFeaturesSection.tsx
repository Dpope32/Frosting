import React from 'react';
import { YStack, XStack, H3, Text, Card, isWeb } from 'tamagui';
import { features } from '@/constants/features';

export const MobileFeaturesSection = () => {
  if (isWeb) return null;

  return (
    <YStack width="100%" alignItems="center" paddingVertical="$8">
      <XStack flexWrap="wrap" justifyContent="center" gap="$4" maxWidth={1200} width="100%">
        {features.map((feature) => (
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
        ))}
      </XStack>
    </YStack>
  );
}; 