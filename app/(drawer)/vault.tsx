import React from 'react';
import { ScrollView } from 'react-native';
import { YStack, Text, Card, XStack } from 'tamagui';
import { useVault } from '@/hooks/useVault';
import { BlurView } from 'expo-blur';
import { useUserStore } from '@/store/UserStore';

export default function VaultScreen() {
  const { data, isLoading } = useVault();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  // Array of colors for dynamic name coloring
  const nameColors = ['#FF6B6B', '#4ECDC4', '#FFD93D', '#A29BFE', '#F78FB3'];

  if (isLoading) {
    return (
      <YStack f={1} jc="center" ai="center" mt={80} backgroundColor="#1a1a1a">
        <Text color="#FFFFFF" fontSize="$4">Loading...</Text>
      </YStack>
    );
  }

  return (
    <YStack f={1} mt={90} px="$8" backgroundColor="#121212">
      <ScrollView contentContainerStyle={{ paddingVertical: 20 }}>
        {data?.items.map((cred, index) => (
          <Card
            key={cred.id}
            mb="$4"
            p="$3"
            backgroundColor="rgba(30, 30, 30, 0.95)"
            borderRadius="$4"
            borderWidth={1}
            borderColor="rgba(255, 255, 255, 0.2)"
          >
            <XStack gap="$2" alignItems="center" mb="$2">
              <Text
                color={nameColors[index % nameColors.length]}
                fontSize="$5"
                fontWeight="bold"
              >
                {cred.name}
              </Text>
            </XStack>
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text color="rgba(255, 255, 255, 0.7)">Username:</Text>
                <Text color="#F5F5DC" fontWeight="bold">{cred.username}</Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Text color="rgba(255, 255, 255, 0.7)">Password:</Text>
                <Text color="#F5F5DC" fontWeight="bold">{cred.password}</Text>
              </XStack>
            </YStack>
          </Card>
        ))}
      </ScrollView>
      <BlurView
        intensity={20}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />
    </YStack>
  );
}
