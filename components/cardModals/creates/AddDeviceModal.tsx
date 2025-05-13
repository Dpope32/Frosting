import React, { useState } from 'react';
import { TouchableOpacity, ActivityIndicator, useWindowDimensions } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, YStack, XStack } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BaseCardAnimated } from '@/components/baseModals/BaseCardAnimated';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { generateSyncKey } from '@/sync/registrySyncManager';
import { baseSpacing, fontSizes, cardRadius, buttonRadius, getColors } from '@/components/sync/sharedStyles';

export default function AddDeviceModal({ onClose }: { onClose: () => void }) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [isLoading, setIsLoading] = useState(false);
  const [deviceId, setDeviceId] = useState('');
  const [peerCode, setPeerCode] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>('choose');
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);

  const handleCreateSpace = async () => {
    setModalStep('creating');
    try {
      console.log('🔄 Creating sync space...');
      setIsLoading(true);

      // Generate device ID using the sync key
      const syncKey = await generateSyncKey();
      console.log('📱 Device sync key generated:', syncKey ? '✅ Success' : '❌ Failed');
      
      if (!syncKey) {
        throw new Error('Failed to generate device sync key');
      }
      
      setDeviceId(syncKey);
      console.log('🔑 Device ID set to:', syncKey);
      
      setDevices([
        {
          id: syncKey,
          name: 'This Device',
          status: 'Ready',
          isCurrentDevice: true,
          lastActive: Date.now()
        }
      ]);
      setIsInitialized(true);
      setModalStep('showCode');
      console.log('✅ Sync space created successfully');
      useToastStore.getState().showToast('Your device is ready to connect with others', 'success');
    } catch (error) {
      console.error('❌ Error initializing sync service:', error);
      useToastStore.getState().showToast('Failed to initialize sync', 'error');
      setModalStep('choose');
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinSpace = () => {
    setModalStep('joining');
  };

  const connectToPeer = async () => {
    if (!peerCode.trim()) {
      useToastStore.getState().showToast('Please enter a valid device code', 'error');
      return;
    }
    setIsLoading(true);
    try {
      setDevices(prev => [...prev, {
        id: peerCode.trim(),
        name: 'Connected Device',
        status: 'Connected',
        isCurrentDevice: false,
        lastActive: Date.now()
      }]);
      useToastStore.getState().showToast('Successfully connected to device', 'success');
      setModalStep('connected');
    } catch (error) {
      console.error('Failed to connect:', error);
      useToastStore.getState().showToast('Failed to connect to device', 'error');
      // Do not add device or advance modal step
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <BaseCardAnimated
      title={modalStep === 'connected' ? 'Connected Devices' : 'Add New Device'}
      onClose={onClose}
    >
      <YStack gap={baseSpacing * 2} padding={baseSpacing}>
        {modalStep === 'choose' && (
          <>
            <Text color={colors.subtext} fontSize={fontSizes.md}>
              How would you like to sync this device?
            </Text>
            <Button
              onPress={handleCreateSpace}
              backgroundColor={colors.accentBg}
              borderColor={colors.accent}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.accent} fontSize={fontSizes.md} fontWeight="600">
                Create New Sync Space
              </Text>
            </Button>
            <Button
              onPress={handleJoinSpace}
              backgroundColor={colors.card}
              borderColor={colors.border}
              borderWidth={2}
              size="$3"
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
            >
              <Text color={colors.text} fontSize={fontSizes.md} fontWeight="600">
                Join Existing Sync Space
              </Text>
            </Button>
          </>
        )}
        {modalStep === 'creating' && (
          <YStack alignItems="center" justifyContent="center" padding={baseSpacing * 2}>
            <ActivityIndicator size="large" color={colors.accent} />
            <Text marginTop={baseSpacing} color={colors.subtext}>
              Initializing your device...
            </Text>
          </YStack>
        )}
        {modalStep === 'showCode' && (
          <YStack backgroundColor={colors.card} padding={baseSpacing * 3} borderRadius={cardRadius} marginBottom={baseSpacing * 2}>
            <Text fontSize={fontSizes.sm} color={colors.subtext}>
              Your Device Code:
            </Text>
            <XStack justifyContent="space-between" alignItems="center" marginTop={baseSpacing}>
              <Text fontSize={fontSizes.lg} fontWeight="600" color={colors.text}>
                {deviceId ? deviceId : "Device code unavailable. Please try again or contact support."}
              </Text>
              <Button 
                size="$3" 
                onPress={async () => {
                  if (!deviceId) {
                    useToastStore.getState().showToast('No device code to copy', 'error');
                    return;
                  }
                  await Clipboard.setStringAsync(deviceId);
                  useToastStore.getState().showToast('Device code copied', 'success');
                }}
                style={{ borderRadius: buttonRadius }}
              >
                Copy
              </Button>
            </XStack>
            <Text fontSize={fontSizes.xs} color={colors.subtext} marginTop={baseSpacing}>
              Share this code with your other devices to connect them.
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
              <Text color={colors.accent} fontSize={fontSizes.md} fontWeight="600">
                Done
              </Text>
            </Button>
          </YStack>
        )}
        {modalStep === 'joining' && (
          <YStack gap={baseSpacing * 2} padding={baseSpacing}>
            <Text color={colors.subtext} fontSize={fontSizes.md}>
              Enter the device code from your other device:
            </Text>
            <TextInput
              style={{
                backgroundColor: colors.card,
                padding: baseSpacing * 2,
                borderRadius: cardRadius,
                color: colors.text,
                fontSize: fontSizes.lg,
                borderWidth: 1,
                borderColor: colors.border,
              }}
              value={peerCode}
              onChangeText={setPeerCode}
              placeholder="Enter device code"
              placeholderTextColor={colors.subtext}
            />
            <Button
              onPress={connectToPeer}
              backgroundColor={colors.accent}
              height={44}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
              style={{ borderRadius: buttonRadius }}
            >
              <Text color="#fff" fontSize={fontSizes.md} fontWeight="600">
                Connect
              </Text>
            </Button>
          </YStack>
        )}
        {modalStep === 'connected' && (
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
            <Button
              onPress={() => setModalStep('choose')}
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
              <Text color={colors.accent} fontSize={fontSizes.md} fontWeight="600">
                Add Another Device
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
              <Text color={colors.text} fontSize={fontSizes.md} fontWeight="600">
                Close
              </Text>
            </Button>
          </YStack>
        )}
      </YStack>
    </BaseCardAnimated>
  );
}

