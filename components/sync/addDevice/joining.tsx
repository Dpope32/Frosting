import React from 'react';
import { ActivityIndicator, TextInput } from 'react-native';
import { Text, Button, YStack } from 'tamagui';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, Colors } from '@/components/sync/sharedStyles';

type JoiningProps = {
  colors: Colors;
  inputWorkspaceId: string;
  setInputWorkspaceId: (text: string) => void;
  inputInviteCode: string;
  setInputInviteCode: (text: string) => void;
  connectToWorkspace: () => void;
  isLoading: boolean;
};

export function Joining({
  colors,
  inputWorkspaceId,
  setInputWorkspaceId,
  inputInviteCode,
  setInputInviteCode,
  connectToWorkspace,
  isLoading,
}: JoiningProps) {
  return (
    <YStack gap={baseSpacing * 2} padding={baseSpacing}>
      <Text color={colors.subtext} fontFamily="$body" fontSize={fontSizes.md}>
        Enter the Workspace ID and Invite Code:
      </Text>
      <TextInput
        style={{
          backgroundColor: colors.card,
          padding: baseSpacing * 1.5,
          borderRadius: cardRadius,
          color: colors.text,
          fontSize: fontSizes.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        value={inputWorkspaceId}
        onChangeText={setInputWorkspaceId}
        placeholder="Workspace ID"
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
      />
      <TextInput
        style={{
          backgroundColor: colors.card,
          padding: baseSpacing * 1.5,
          borderRadius: cardRadius,
          color: colors.text,
          fontSize: fontSizes.md,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        value={inputInviteCode}
        onChangeText={setInputInviteCode}
        placeholder="Invite Code"
        placeholderTextColor={colors.subtext}
        autoCapitalize="none"
      />
      <Button
        onPress={connectToWorkspace}
        backgroundColor={colors.accent}
        height={44}
        pressStyle={{ scale: 0.97 }}
        animation="quick"
        style={{ borderRadius: buttonRadius }}
        disabled={isLoading}
      >
        {isLoading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text color="#fff" fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
            Join Workspace
          </Text>
        )}
      </Button>
    </YStack>
  );
}
