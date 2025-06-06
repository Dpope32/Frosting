import React from 'react';
import { ActivityIndicator } from 'react-native';
import { Text, YStack } from 'tamagui';
import { baseSpacing, Colors } from '@/components/sync/sharedStyles';

type CreatingProps = {
  colors: Colors;
};

export function Creating({ colors }: CreatingProps) {
  return (
    <YStack alignItems="center" justifyContent="center" paddingVertical={baseSpacing * 2}>
      <ActivityIndicator size="large" color={colors.accent} />
      <Text marginTop={baseSpacing} fontFamily="$body" color={colors.subtext}>
        Creating your sync workspace...
      </Text>
    </YStack>
  );
}
