import React from 'react';
import { View, useWindowDimensions, TouchableOpacity } from 'react-native';
import { Text, Button, XStack } from 'tamagui';
import { useUserStore } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';

const baseSpacing = 8;
const fontSizes = {
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 22,
  xxl: 28,
};
const cardRadius = 12;
const buttonRadius = 20;
const getColors = (isDark: boolean, primaryColor: string) => ({
  bg: isDark ? '#181A20' : '#fff',
  card: isDark ? '#23262F' : '#F7F8FA',
  border: isDark ? '#333' : '#E3E5E8',
  text: isDark ? '#fff' : '#181A20',
  subtext: isDark ? '#fff' : '#666',
  accent: primaryColor,
  accentBg: isDark ? `${primaryColor}33` : `${primaryColor}30`,
  error: isDark ? '#E74C3C' : '#E74C3C',
  success: isDark ? '#27AE60' : '#27AE60',
  disabled: isDark ? '#333' : '#eee',
});

interface SyncTableProps {
  isDark: boolean;
  primaryColor: string;
  syncStatus: string;
  currentSpaceId: string;
  deviceId: string;
  inviteCode?: string | null;
  onCopyInviteCode?: () => Promise<void>;
  onCopyCurrentSpaceId?: () => Promise<void>;
}

export default function SyncTable({ 
  isDark, 
  primaryColor, 
  syncStatus, 
  currentSpaceId, 
  deviceId,
  inviteCode,
  onCopyInviteCode,
  onCopyCurrentSpaceId
}: SyncTableProps) {
  const premium = useUserStore((state) => state.preferences.premium === true);
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 350);

return (
<View style={{
    backgroundColor: colors.card,
    borderRadius: cardRadius,
    padding: baseSpacing * 2,
    borderWidth: 1,
    borderColor: colors.border,
    width: contentWidth,
    alignSelf: 'center',
    marginVertical: baseSpacing,
  }}>
    <XStack alignItems="center" justifyContent="space-between">
      <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.text} fontWeight="600">
        Premium Sync
      </Text>
      <Button
        size="$2"
        backgroundColor={premium ? colors.success : colors.error}
        onPress={() => setPreferences({ premium: !premium })}
        borderRadius={buttonRadius}
        paddingHorizontal={baseSpacing * 2}
        pressStyle={{ scale: 0.97 }}
        animation="quick"
      >
        <Text color="#fff" fontWeight="700" fontFamily="$body">
          {premium ? 'Enabled' : 'Disabled'}
        </Text>
      </Button>
    </XStack>
    
    <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
    <XStack alignItems="center" justifyContent="space-between">
      <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
        Sync Status
      </Text>
      <Text fontSize={fontSizes.sm} fontFamily="$body" color={syncStatus === 'error' ? colors.error : syncStatus === 'syncing' ? colors.accent : currentSpaceId ? colors.success : colors.subtext}>
        {syncStatus === 'error' ? 'Error' : syncStatus === 'syncing' ? 'Syncing' : currentSpaceId ? 'Connected' : 'Not Connected'}
      </Text>
    </XStack>
    {deviceId && (
      <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
        <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
          Device ID
        </Text>
        <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.text}>
          {deviceId.substring(0, 10)}...
        </Text>
      </XStack>
    )}
    {inviteCode && currentSpaceId && (
      <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
        <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
          Invite Code
        </Text>
        <TouchableOpacity 
          onPress={onCopyInviteCode || (() => {})}
          style={{ 
            flexDirection: 'row', 
            alignItems: 'center', 
            backgroundColor: colors.accentBg,
            paddingHorizontal: baseSpacing,
            paddingVertical: baseSpacing / 2,
            borderRadius: buttonRadius / 2,
          }}
        >
          <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.accent} marginRight={baseSpacing / 2}>
            {inviteCode}
          </Text>
          <MaterialIcons name="content-copy" size={14} color={colors.accent} />
        </TouchableOpacity>
      </XStack>
    )}
    {currentSpaceId && (
      <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
      <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
        Current Space ID
      </Text>
      <TouchableOpacity 
        onPress={onCopyCurrentSpaceId || (() => {})}
        style={{ 
          flexDirection: 'row', 
          alignItems: 'center', 
          backgroundColor: colors.accentBg,
          paddingHorizontal: baseSpacing,
          paddingVertical: baseSpacing / 2,
          borderRadius: buttonRadius / 2,
        }}
      >
        <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.accent} marginRight={baseSpacing / 2}>
          {currentSpaceId}
        </Text>
        <MaterialIcons name="content-copy" size={14} color={colors.accent} />
      </TouchableOpacity>
    </XStack>
    )}
  </View>
)
}
