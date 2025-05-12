import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { isIpad } from '@/utils/deviceUtils';
import AddDeviceModal from '@/components/cardModals/creates/AddDeviceModal';

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

export default function SyncScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [deviceId, setDeviceId] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>('choose');
  const premium = useUserStore((state) => state.preferences.premium === true);
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: isIpad() ? 30 : insets.top }]}>
      <YStack gap={baseSpacing * 2} padding={isWeb ? "$4" : "$2"} px={isWeb ? "$4" : "$5"}>
        <XStack alignItems="center" justifyContent="center" position="relative">
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <MaterialIcons 
              name="arrow-back" 
              size={22} 
              color={isDark ? "#fff" : "#000"} 
            />
          </TouchableOpacity>
          <Text 
            fontSize={isWeb ? 24 : isIpad() ? 22 : 20} 
            fontWeight="700" 
            color={isDark ? "#fff" : "#000"}
            style={{ textAlign: 'center', flex: 1 }}
            fontFamily="$body"
          >
            Sync Devices
          </Text>
        </XStack>

        <View style={{
          backgroundColor: colors.card,
          borderRadius: cardRadius,
          padding: baseSpacing * 2,
          borderWidth: 1,
          borderColor: colors.border,
          width: contentWidth,
          alignSelf: 'center',
          marginBottom: baseSpacing * 63,
          marginTop: baseSpacing * 2,
        }}>
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={fontSizes.md} color={colors.text} fontWeight="600">
              Premium Sync
            </Text>
            <Button
              size="$2"
              backgroundColor={premium ? colors.success : colors.error}
              onPress={() => setPreferences({ premium: !premium })}
              borderRadius={buttonRadius}
              paddingHorizontal={baseSpacing * 3}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
            >
              <Text color="#fff" fontWeight="700">
                {premium ? 'Enabled' : 'Disabled'}
              </Text>
            </Button>
          </XStack>
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: baseSpacing * 2 }} />
          <XStack alignItems="center" justifyContent="space-between">
            <Text fontSize={fontSizes.md} color={colors.subtext}>
              Sync Status
            </Text>
            <Text fontSize={fontSizes.sm} color={currentSpaceId ? colors.success : colors.subtext}>
              {currentSpaceId ? 'Connected' : 'Not Connected'}
            </Text>
          </XStack>
        </View>

        {premium && (
          <>
            {isLoading ? (
              <YStack alignItems="center" justifyContent="center" padding={baseSpacing * 2}>
                <ActivityIndicator size="large" color={colors.accent} />
                <Text marginTop={baseSpacing} color={colors.subtext}>
                  {currentSpaceId ? 'Connecting to sync space...' : 'Creating sync space...'}
                </Text>
              </YStack>
            ) : (
              <YStack gap={baseSpacing}>
                {devices.map((device: any) => (
                  <XStack
                    key={device.id}
                    padding={baseSpacing * 2}
                    backgroundColor={colors.card}
                    borderRadius={cardRadius}
                    borderWidth={1}
                    borderColor={colors.border}
                    justifyContent="space-between"
                    alignItems="center"
                    width={contentWidth}
                    alignSelf="center"
                  >
                    <YStack>
                      <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                        {device.name}
                      </Text>
                      <Text fontSize={fontSizes.sm} color={colors.subtext}>
                        {device.isCurrentDevice
                          ? (devices.length > 1 ? 'Connected' : 'Waiting for other devices')
                          : device.status + ' • Last active: ' + new Date(device.lastActive).toLocaleDateString()}
                      </Text>
                    </YStack>
                    {!device.isCurrentDevice && (
                      <TouchableOpacity>
                        <MaterialIcons 
                          name="more-vert" 
                          size={24} 
                          color={colors.text} 
                        />
                      </TouchableOpacity>
                    )}
                  </XStack>
                ))}
              </YStack>
            )}
          </>
        )}
      </YStack>

      <YStack
        position="absolute"
        left={0}
        right={0}
        alignItems="center"
        style={{ bottom: isIpad() ? 50 : 30 }}
        pointerEvents="box-none"
      >
        <Button
          width={contentWidth}
          backgroundColor={premium ? colors.accentBg : colors.accentBg}
          borderRadius={buttonRadius}
          minHeight={isIpad() ? 50 : 48}
          height={isIpad() ? 50 : 48}
          alignItems="center"
          justifyContent="center"
          pressStyle={{ scale: 0.97 }}
          borderWidth={2}
          borderColor={colors.accent}
          animation="bouncy"
          elevation={0}
          onPress={() => {
            if (!premium) {
              setPreferences({ premium: true });
              useToastStore.getState().showToast('Premium sync enabled!', 'success');
            } else {
              setShowAddDevice(true);
              if (deviceId) {
                setModalStep('showCode');
              } else {
                setModalStep('choose');
              }
            }
          }}
        >
          <Text style={{color: 'white', fontSize: fontSizes.lg, textAlign: 'center', width: '100%', fontWeight: '500', fontFamily: '$body', letterSpacing: 1 }} numberOfLines={1} ellipsizeMode="tail">
            {premium ? 'Add Device' : 'Enable Sync'}
          </Text>
        </Button>
      </YStack>

      {showAddDevice && (
        <AddDeviceModal onClose={() => setShowAddDevice(false)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 1,
  },
});
