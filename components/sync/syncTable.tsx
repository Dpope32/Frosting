// Fixed SyncTable - Remove duplicates and organize properly
import React from 'react';
import { View, useWindowDimensions, TouchableOpacity, Platform } from 'react-native';
import { Text, Button, XStack, YStack, isWeb } from 'tamagui';
import { usePortfolioStore, useUserStore } from '@/store';
import { MaterialIcons } from '@expo/vector-icons';
import { useBillStore } from '@/store/BillStore';
import { useVaultStore } from '@/store/VaultStore';
import { useProjectStore } from '@/store/ProjectStore';
import { useNoteStore } from '@/store/NoteStore';
import { usePeopleStore } from '@/store/People';
import { useHabitStore } from '@/store/HabitStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { baseSpacing, cardRadius, fontSizes, getColors, buttonRadius, getDeviceIcon, getDeviceStatusColor, Colors } from '@/components/sync';
import { isIpad } from '@/utils/deviceUtils';

export interface Device {
  id: string;
  name: string;
  isCurrentDevice: boolean;
  status: string;
  lastActive: string;
  deviceType?: 'ios' | 'android' | 'web' | 'desktop';
  syncEnabled?: boolean;
}

interface SyncTableProps {
  isDark: boolean;
  primaryColor: string;
  syncStatus: string;
  currentSpaceId: string;
  inviteCode?: string | null;
  devices?: Device[];
  onCopyInviteCode?: () => Promise<void>;
  onCopyCurrentSpaceId?: () => Promise<void>;
  onDeviceAction?: (deviceId: string, action: 'remove' | 'sync') => void;
  onLeaveWorkspace?: () => void;
}

export default function SyncTable({ 
  isDark, 
  primaryColor, 
  syncStatus, 
  currentSpaceId, 
  inviteCode,
  devices = [],
  onCopyInviteCode,
  onCopyCurrentSpaceId,
  onDeviceAction,
  onLeaveWorkspace
}: SyncTableProps) {
  const premium = useUserStore((state) => state.preferences.premium === true);
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = isWeb ? width * 0.7025 : isIpad() ? Math.min(width - baseSpacing * 2, 600) : Math.min(width - baseSpacing * 2, 350);
  
  // Store hooks
  const isBillSyncEnabled = useBillStore((state) => state.isSyncEnabled);
  const toggleBillSync = useBillStore((state) => state.toggleBillSync);
  const isVaultSyncEnabled = useVaultStore((state) => state.isSyncEnabled);
  const toggleVaultSync = useVaultStore((state) => state.toggleVaultSync);
  const isProjectSyncEnabled = useProjectStore((state) => state.isSyncEnabled);
  const toggleProjectSync = useProjectStore((state) => state.toggleProjectSync);
  const isPeopleSyncEnabled = usePeopleStore((state) => state.isSyncEnabled);
  const togglePeopleSync = usePeopleStore((state) => state.togglePeopleSync);
  const isHabitSyncEnabled = useHabitStore((state) => state.isSyncEnabled);
  const toggleHabitSync = useHabitStore((state) => state.toggleHabitSync);
  const isCalendarSyncEnabled = useCalendarStore((state) => state.isSyncEnabled);
  const toggleCalendarSync = useCalendarStore((state) => state.toggleCalendarSync);
  const isNoteSyncEnabled = useNoteStore((state) => state.isSyncEnabled);
  const toggleNoteSync = useNoteStore((state) => state.toggleNoteSync);
  const togglePortfolioSync = usePortfolioStore((state) => state.togglePortfolioSync);
  const isPortfolioSyncEnabled = usePortfolioStore((state) => state.isSyncEnabled);

  
  const getConnectionStatus = (premium: boolean, syncStatus: string, currentSpaceId: string) => {
    return React.useMemo(() => {
      if (!premium) return 'Premium Required';
      if (syncStatus === 'error') return 'Error';
      if (syncStatus === 'syncing') return 'Syncing';
      if (currentSpaceId) return 'Connected';
      return 'Not Connected';
    }, [premium, syncStatus, currentSpaceId]);
  };

  const getStatusColor = () => {
    return React.useMemo(() => {
      if (syncStatus === 'error') return colors.error;
      if (syncStatus === 'syncing') return colors.accent;
      if (currentSpaceId) return colors.success;
      return colors.subtext;
    }, [syncStatus, currentSpaceId, colors]);
  };
  
  // FIXED: Remove duplicate entries, organize cleanly with 6 items total
  const syncSettings = [
    { key: 'bills', label: 'Bills', enabled: isBillSyncEnabled, toggle: toggleBillSync },
    { key: 'crm', label: 'CRM', enabled: isPeopleSyncEnabled, toggle: togglePeopleSync },
    { key: 'notes', label: 'Notes', enabled: isNoteSyncEnabled, toggle: toggleNoteSync },
    { key: 'vault', label: 'Passwords', enabled: isVaultSyncEnabled, toggle: toggleVaultSync },
    { key: 'projects', label: 'Projects', enabled: isProjectSyncEnabled, toggle: toggleProjectSync },
    { key: 'portfolio', label: 'Portfolio', enabled: isPortfolioSyncEnabled, toggle: togglePortfolioSync },
    { key: 'habits', label: 'Habits', enabled: isHabitSyncEnabled, toggle: toggleHabitSync },
    { key: 'calendar', label: 'Calendar', enabled: isCalendarSyncEnabled, toggle: toggleCalendarSync },
  ];

  return (
    <View style={{
      backgroundColor: colors.card,
      borderRadius: cardRadius,
      padding: baseSpacing * 2,
      borderWidth: 1,
      borderColor: colors.border,
      width: contentWidth,
      alignSelf: 'center',
    }}>
      <XStack alignItems="center" justifyContent="space-between">
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
        <XStack alignItems="center" gap={6}>
          <View style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: getStatusColor(),
          }} />
          <Text fontSize={fontSizes.sm} fontFamily="$body" color={getStatusColor()} fontWeight="500">
            {getConnectionStatus(premium, syncStatus, currentSpaceId)}
          </Text>
      </XStack>
      </XStack>
      <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />

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
            <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.accent} marginRight={baseSpacing / 2} fontWeight="600">
              {inviteCode}
            </Text>
            <MaterialIcons name="content-copy" size={14} color={colors.accent} />
          </TouchableOpacity>
        </XStack>
      )}

      {currentSpaceId && (
        <XStack alignItems="center" justifyContent="space-between" marginTop={baseSpacing}>
          <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.subtext}>
            Workspace ID
          </Text>
          <XStack alignItems="center" gap={6}>
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
              <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.accent} marginRight={baseSpacing / 2} fontWeight="500">
                {currentSpaceId.substring(0, 8)}...
              </Text>
              <MaterialIcons name="content-copy" size={14} color={colors.accent} />
            </TouchableOpacity>
            
            {onLeaveWorkspace && (
              <TouchableOpacity 
                onPress={onLeaveWorkspace}
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  backgroundColor: 'rgba(255,59,48,0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MaterialIcons name="close" size={14} color={colors.error} />
              </TouchableOpacity>
            )}
          </XStack>
        </XStack>
      )}

      {premium && devices.length > 0 && (
        <>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
          <XStack alignItems="center" justifyContent="space-between" marginBottom={baseSpacing}>
            <Text fontSize={fontSizes.md} fontFamily="$body" color={colors.text} fontWeight="600">
              Connected Devices
            </Text>
            <Text fontSize={fontSizes.xs} fontFamily="$body" color={colors.subtext}>
              {devices.length} device{devices.length !== 1 ? 's' : ''}
            </Text>
          </XStack>
          
          <YStack gap={baseSpacing}>
            {devices.map((device) => (
              <XStack
                key={device.id}
                alignItems="center"
                justifyContent="space-between"
                backgroundColor={device.isCurrentDevice ? colors.accentBg : 'transparent'}
                borderRadius={8}
                padding={baseSpacing}
                borderWidth={device.isCurrentDevice ? 1 : 0}
                borderColor={device.isCurrentDevice ? colors.accent : 'transparent'}
              >
                <XStack alignItems="center" gap={baseSpacing} flex={1}>
                  <MaterialIcons 
                    name={getDeviceIcon(device.deviceType)} 
                    size={20} 
                    color={getDeviceStatusColor(device, colors)} 
                  />
                  <YStack flex={1}>
                    <XStack alignItems="center" gap={6}>
                      <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.text} fontWeight="500">
                        {device.name}
                      </Text>
                      {device.isCurrentDevice && (
                        <View style={{
                          backgroundColor: colors.accent,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          borderRadius: 4,
                        }}>
                          <Text fontSize={10} color="white" fontWeight="600">This Device</Text>
                        </View>
                      )}
                    </XStack>
                    <Text fontSize={fontSizes.xs} fontFamily="$body" color={colors.subtext}>
                      {device.isCurrentDevice 
                        ? (devices.length > 1 ? 'Connected & Syncing' : 'Waiting for other devices')
                        : `${device.status} • Last seen ${new Date(device.lastActive).toLocaleDateString()}`}
                    </Text>
                  </YStack>
                </XStack>
                
                {!device.isCurrentDevice && onDeviceAction && (
                  <TouchableOpacity 
                    onPress={() => onDeviceAction(device.id, 'remove')}
                    style={{ padding: 4 }}
                  >
                    <MaterialIcons name="more-vert" size={20} color={colors.subtext} />
                  </TouchableOpacity>
                )}
              </XStack>
            ))}
          </YStack>
        </>
      )}

      {premium && (
        <>
          {currentSpaceId || devices.length > 0 ? (
            <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 1.5}} />
          ) : null}
          <XStack gap={baseSpacing * 4}>
  
            <YStack flex={1} gap={baseSpacing}>
              {syncSettings.slice(0, 4).map((setting, index) => (
                <React.Fragment key={setting.key}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext}>
                      {setting.label}
                    </Text>
                    <Button
                      size="$2"
                      backgroundColor={setting.enabled ? isDark ? colors.successBgDark : colors.successBgLight : colors.disabledBg}
                      onPress={setting.toggle}
                      borderRadius={buttonRadius}
                      paddingHorizontal={baseSpacing * 1.5}
                      pressStyle={{ scale: 0.97 }}
                      animation="quick"
                      borderColor={setting.enabled ? isDark ? colors.successBorder : colors.successBorder : colors.disabledBorder}
                    >
                      <Text color={setting.enabled ? colors.successText : colors.disabledText} fontWeight="600" fontFamily="$body" fontSize={fontSizes.xs}>
                        {setting.enabled ? 'ON' : 'OFF'}
                      </Text>
                    </Button>
                  </XStack>
                  {index < 3 && <View style={{ height: 1, backgroundColor: colors.border }} />}
                </React.Fragment>
              ))}
            </YStack>

            <YStack flex={1} gap={baseSpacing}>
              {syncSettings.slice(4).map((setting, index) => (
                <React.Fragment key={setting.key}>
                  <XStack alignItems="center" justifyContent="space-between">
                    <Text fontSize={fontSizes.sm} fontFamily="$body" color={colors.subtext}>
                      {setting.label}
                    </Text>
                    <Button
                      size="$2"
                      backgroundColor={setting.enabled ? isDark ? colors.successBgDark : colors.successBgLight : colors.disabledBg}
                      onPress={setting.toggle}
                      borderRadius={buttonRadius}
                      paddingHorizontal={baseSpacing * 1.5}
                      pressStyle={{ scale: 0.97 }}
                      animation="quick"
                      borderColor={setting.enabled ? isDark ? colors.successBorder : colors.successBorder : colors.disabledBorder}
                    >
                      <Text color={setting.enabled ? colors.successText : colors.disabledText} fontWeight="600" fontFamily="$body" fontSize={fontSizes.xs}>
                        {setting.enabled ? 'ON' : 'OFF'}
                      </Text>
                    </Button>
                  </XStack>
                  {index < 3 && <View style={{ height: 1, backgroundColor: colors.border }} />}
                </React.Fragment>
              ))}
            </YStack>
          </XStack>
        </>
      )}
    </View>
  );
}