import React from 'react';
import { View, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, XStack } from 'tamagui';
import { useUserStore } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useBillStore } from '@/store/BillStore';
import { useVaultStore } from '@/store/VaultStore';
import { useProjectStore } from '@/store/ProjectStore';
import { usePeopleStore } from '@/store/People';
import { useHabitStore } from '@/store/HabitStore';
import { useCalendarStore } from '@/store/CalendarStore';

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
  inviteCode?: string | null;
  onCopyInviteCode?: () => Promise<void>;
  onCopyCurrentSpaceId?: () => Promise<void>;
}

export default function SyncTable({ 
  isDark, 
  primaryColor, 
  syncStatus, 
  currentSpaceId, 
  inviteCode,
  onCopyInviteCode,
  onCopyCurrentSpaceId
}: SyncTableProps) {
  const premium = useUserStore((state) => state.preferences.premium === true);
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const isWeb = Platform.OS === 'web';
  const isTablet = Platform.OS === 'ios' && (Platform as any).isPad === true;
  const wideMode = isWeb || isTablet;
  const contentWidth = wideMode ? Math.min(width - baseSpacing * 2, 700) : Math.min(width - baseSpacing * 2, 350);
  
  // BillStore state and actions
  const isBillSyncEnabled = useBillStore((state) => state.isSyncEnabled);
  const toggleBillSync = useBillStore((state) => state.toggleBillSync);

  // VaultStore state and actions
  const isVaultSyncEnabled = useVaultStore((state) => state.isSyncEnabled);
  const toggleVaultSync = useVaultStore((state) => state.toggleVaultSync);

  // ProjectStore (for actual projects) state and actions
  const isProjectSyncEnabled = useProjectStore((state) => state.isSyncEnabled);
  const toggleProjectSync = useProjectStore((state) => state.toggleProjectSync);

  // PeopleStore (Contacts) state and actions
  const isPeopleSyncEnabled = usePeopleStore((state) => state.isSyncEnabled);
  const togglePeopleSync = usePeopleStore((state) => state.togglePeopleSync);

  // HabitStore state and actions
  const isHabitSyncEnabled = useHabitStore((state) => state.isSyncEnabled);
  const toggleHabitSync = useHabitStore((state) => state.toggleHabitSync);

  // CalendarStore state and actions
  const isCalendarSyncEnabled = useCalendarStore((state) => state.isSyncEnabled);
  const toggleCalendarSync = useCalendarStore((state) => state.toggleCalendarSync);
  
  // More explicit connection status determination
  const connectionStatus = React.useMemo(() => {
    if (!premium) return 'Premium Required';
    if (syncStatus === 'error') return 'Error';
    if (syncStatus === 'syncing') return 'Syncing';
    if (currentSpaceId) return 'Connected';
    return 'Not Connected';
  }, [premium, syncStatus, currentSpaceId]);
  
  const statusColor = React.useMemo(() => {
    if (syncStatus === 'error') return colors.error;
    if (syncStatus === 'syncing') return colors.accent;
    if (currentSpaceId) return colors.success;
    return colors.subtext;
  }, [syncStatus, currentSpaceId, colors]);

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
      <Text fontSize={fontSizes.sm} fontFamily="$body" color={statusColor}>
        {connectionStatus}
      </Text>
    </XStack>
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

    {premium && (
      <>
        {wideMode ? (
          <XStack marginTop={baseSpacing}>
            <View style={{ flex: 1, marginRight: baseSpacing }}>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Bills
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isBillSyncEnabled ? colors.success : colors.disabled}
                  onPress={toggleBillSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isBillSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Passwords
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isVaultSyncEnabled ? colors.success : colors.disabled}
                  onPress={toggleVaultSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isVaultSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Projects
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isProjectSyncEnabled ? colors.success : colors.disabled}
                  onPress={toggleProjectSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isProjectSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
            </View>
            <View style={{ flex: 1, marginLeft: baseSpacing }}>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Contacts
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isPeopleSyncEnabled ? colors.success : colors.disabled}
                  onPress={togglePeopleSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isPeopleSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Habits
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isHabitSyncEnabled ? colors.success : colors.disabled}
                  onPress={toggleHabitSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isHabitSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
              <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5 }} />
              <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
                <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                  Calendar
                </Text>
                <Button
                  size="$2"
                  backgroundColor={isCalendarSyncEnabled ? colors.success : colors.disabled}
                  onPress={toggleCalendarSync}
                  borderRadius={buttonRadius}
                  paddingHorizontal={baseSpacing * 2}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontWeight="700" fontFamily="$body">
                    {isCalendarSyncEnabled ? 'ON' : 'OFF'}
                  </Text>
                </Button>
              </XStack>
            </View>
          </XStack>
        ) : (
          <>
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Bills
              </Text>
              <Button
                size="$2"
                backgroundColor={isBillSyncEnabled ? colors.success : colors.disabled} 
                onPress={toggleBillSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isBillSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>

            {/* Vault (Passwords) Sync Toggle - Only show if premium is enabled */} 
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Passwords
              </Text>
              <Button
                size="$2"
                backgroundColor={isVaultSyncEnabled ? colors.success : colors.disabled}
                onPress={toggleVaultSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isVaultSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>

            {/* Project Sync Toggle - Only show if premium is enabled */} 
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Projects
              </Text>
              <Button
                size="$2"
                backgroundColor={isProjectSyncEnabled ? colors.success : colors.disabled}
                onPress={toggleProjectSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isProjectSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>

            {/* People (Contacts) Sync Toggle - Only show if premium is enabled */} 
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Contacts
              </Text>
              <Button
                size="$2"
                backgroundColor={isPeopleSyncEnabled ? colors.success : colors.disabled}
                onPress={togglePeopleSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isPeopleSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>

            {/* Habit Sync Toggle - Only show if premium is enabled */} 
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Habits
              </Text>
              <Button
                size="$2"
                backgroundColor={isHabitSyncEnabled ? colors.success : colors.disabled}
                onPress={toggleHabitSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isHabitSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>

            {/* Calendar Sync Toggle - Only show if premium is enabled */} 
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
            <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
                Calendar
              </Text>
              <Button
                size="$2"
                backgroundColor={isCalendarSyncEnabled ? colors.success : colors.disabled}
                onPress={toggleCalendarSync}
                borderRadius={buttonRadius}
                paddingHorizontal={baseSpacing * 2}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text color="#fff" fontWeight="700" fontFamily="$body">
                  {isCalendarSyncEnabled ? 'ON' : 'OFF'}
                </Text>
              </Button>
            </XStack>
          </>
        )}
      </>
    )}
  </View>
)
}
