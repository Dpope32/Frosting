import React from 'react';
import { Text, Button, YStack, XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, Colors } from '@/components/sync/sharedStyles';

type ConnectedProps = {
  colors: Colors;
  workspaceId: string | null;
  setModalStep: (step: 'choose' | 'creating' | 'showCode' | 'joining' | 'connected') => void;
  onClose: () => void;
  contentWidth: number;
};

export function Connected({ colors, workspaceId, setModalStep, onClose, contentWidth }: ConnectedProps) {
  return (
    <YStack gap={baseSpacing}>
      {workspaceId ? (
        <YStack>
          <XStack
            padding={baseSpacing * 2}
            backgroundColor={colors.accentBg}
            borderRadius={cardRadius}
            borderWidth={1}
            borderColor={colors.accent}
            justifyContent="space-between"
            alignItems="center"
            width={contentWidth}
            alignSelf="center"
          >
            <YStack>
              <Text fontSize={fontSizes.lg} fontFamily="$body" fontWeight="600" color={colors.accent}>
                Connected to Workspace
              </Text>
              <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext} marginTop={4}>
                ID: {workspaceId}
              </Text>
            </YStack>
            <MaterialIcons
              name="check-circle"
              size={24}
              color={colors.accent}
            />
          </XStack>

          <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext} marginTop={baseSpacing * 2} textAlign="center">
            Your data will automatically sync between all devices connected to this workspace.
          </Text>
        </YStack>
      ) : (
        <XStack
          padding={baseSpacing * 2}
          backgroundColor={colors.accentBg} 
          borderRadius={cardRadius}
          borderWidth={1}
          borderColor={colors.error}
          justifyContent="center"
          alignItems="center"
          width={contentWidth}
          alignSelf="center"
        >
          <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.error} textAlign="center">
            No workspace connected. Create or join a workspace to enable sync.
          </Text>
        </XStack>
      )}

      <Button
        onPress={() => setModalStep('choose')}
        backgroundColor={workspaceId ? colors.card : colors.accentBg}
        borderColor={workspaceId ? colors.border : colors.accent}
        borderWidth={2}
        size="$3"
        height={44}
        pressStyle={{ scale: 0.97 }}
        animation="quick"
        marginTop={baseSpacing * 2}
        style={{ borderRadius: buttonRadius }}
      >
        <Text
          color={workspaceId ? colors.text : colors.accent}
          fontSize={fontSizes.md}
          fontWeight="600"
        >
          {workspaceId ? 'Change Workspace' : 'Setup Workspace'}
        </Text>
      </Button>

      <Button
        onPress={onClose}
        backgroundColor={colors.card}
        borderColor={colors.border}
        borderWidth={2}
        size="$3"
        height={44}
        pressStyle={{ scale: 0.97 }}
        animation="quick"
        marginTop={baseSpacing}
        style={{ borderRadius: buttonRadius }}
      >
        <Text color={colors.text} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
          Close
        </Text>
      </Button>
    </YStack>
  );
}
