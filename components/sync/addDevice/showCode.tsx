import React from 'react';
import { Text, Button, YStack, XStack } from 'tamagui';
import * as Clipboard from 'expo-clipboard';
import { useToastStore } from '@/store';
import { addSyncLog } from '@/components/sync/syncUtils';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, Colors } from '@/components/sync/sharedStyles';

type ShowCodeProps = {
  colors: Colors;
  workspaceId: string;
  inviteCode: string;
  setModalStep: (step: 'choose' | 'creating' | 'showCode' | 'joining' | 'connected') => void;
};

export function ShowCode({ colors, workspaceId, inviteCode, setModalStep }: ShowCodeProps) {
  return (
    <YStack backgroundColor={colors.card} padding={baseSpacing * 3} borderRadius={cardRadius} marginBottom={baseSpacing * 2}>
      <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext}>
        Workspace ID:
      </Text>
      <XStack justifyContent="space-between" alignItems="center" marginTop={baseSpacing}>
        <Text fontSize={fontSizes.lg} fontFamily="$body" fontWeight="600" color={colors.text} selectable>
          {workspaceId}
        </Text>
        <Button
          size="$2"
          onPress={async () => {
            await Clipboard.setStringAsync(workspaceId);
            addSyncLog('📋 Workspace ID copied to clipboard', 'verbose');
            useToastStore.getState().showToast('Workspace ID copied', 'success');
          }}
          style={{ borderRadius: buttonRadius }}
        >
          Copy
        </Button>
      </XStack>

      <Text fontSize={fontSizes.sm} color={colors.subtext} marginTop={baseSpacing * 2}>
        Invite Code:
      </Text>
      <XStack justifyContent="space-between" alignItems="center" marginTop={baseSpacing}>
        <Text fontSize={fontSizes.lg} fontFamily="$body" fontWeight="600" color={colors.text} selectable>
          {inviteCode}
        </Text>
        <Button
          size="$2"
          onPress={async () => {
            await Clipboard.setStringAsync(inviteCode);
            addSyncLog('📋 Invite code copied to clipboard', 'verbose');
            useToastStore.getState().showToast('Invite code copied', 'success');
          }}
          style={{ borderRadius: buttonRadius }}
        >
          Copy
        </Button>
      </XStack>

      <Text fontSize={fontSizes.xs} fontFamily="$body" color={colors.subtext} marginTop={baseSpacing}>
        Share both the Workspace ID and Invite Code with your other devices to connect them.
      </Text>

      <Button
        onPress={() => setModalStep('connected')}
        backgroundColor={colors.accentBg}
        borderColor={colors.accent}
        borderWidth={2}
        size="$3"
        height={44}
        pressStyle={{ scale: 0.97 }}
        animation="quick"
        marginTop={baseSpacing * 2}
        style={{ borderRadius: buttonRadius }}
      >
        <Text color={colors.accent} fontFamily="$body" fontSize={fontSizes.md} fontWeight="600">
          Done
        </Text>
      </Button>
    </YStack>
  );
}
