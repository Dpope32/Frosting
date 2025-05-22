import React from 'react';
import { Text, Button, XStack, YStack } from 'tamagui';
import { baseSpacing, fontSizes, buttonRadius, Colors } from '@/components/sync/sharedStyles';

type ChooseAddProps = {
  colors: Colors;
  handleCreateWorkspace: () => void;
  handleJoinWorkspace: () => void;
};

export function ChooseAdd({ colors, handleCreateWorkspace, handleJoinWorkspace }: ChooseAddProps) {
  return (
    <YStack gap={baseSpacing * 2} paddingHorizontal={5} paddingVertical={10}>
      <Text color={colors.subtext} fontFamily="$body" fontSize={fontSizes.md}>
        How would you like to sync your data?
      </Text>
      <XStack gap={baseSpacing} justifyContent="space-between">
        <Button
          onPress={handleCreateWorkspace}
          backgroundColor={colors.accentBg}
          borderColor={colors.accent}
          borderWidth={2}
          size="$3"
          height={44}
          pressStyle={{ scale: 0.97 }}
          animation="quick"
          style={{ borderRadius: buttonRadius }}
          flex={1}
        >
          <Text color={colors.accent} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            New Space
          </Text>
        </Button>
        <Button
          onPress={handleJoinWorkspace}
          backgroundColor={colors.card}
          borderColor={colors.border}
          borderWidth={2}
          size="$3"
          height={44}
          pressStyle={{ scale: 0.97 }}
          animation="quick"
          style={{ borderRadius: buttonRadius }}
          flex={1}
        >
          <Text color={colors.text} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            Join Existing
          </Text>
        </Button>
      </XStack>
    </YStack>
  );
}
