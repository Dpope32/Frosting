import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { Plus } from '@tamagui/lucide-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { BaseCardAnimated } from '@/components/cardModals/BaseCardAnimated';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { TextInput } from 'react-native';
import * as Clipboard from 'expo-clipboard';
import syncService from '@/sync/syncDeviceService';
import { isIpad } from '@/utils/deviceUtils';

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
  const [peerCode, setPeerCode] = useState('');
  const [devices, setDevices] = useState<any[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>('choose');

  useEffect(() => {
    initializeSyncService();
  }, []);

  const initializeSyncService = async () => {
    try {
      setIsLoading(true);
      
      // First get device ID - this will work even if WebRTC isn't supported
      const myDeviceId = await syncService.getConnectionCode();
      setDeviceId(myDeviceId);
      
      // Try to initialize PeerJS
      const initialized = await syncService.initialize()
        .catch(error => {
          console.error('Error initializing sync service:', error);
          return false;
        });
      
      // Add current device to the list regardless of initialization status
      setDevices([
        {
          id: myDeviceId,
          name: 'This Device',
          status: initialized ? 'Ready' : 'Limited Support',
          isCurrentDevice: true,
          lastActive: Date.now()
        }
      ]);
      
      setIsInitialized(true);
      
      if (initialized) {
        setModalStep('showCode');
        useToastStore.getState().showToast('Your device is ready to connect with others', 'success');
      } else {
        setModalStep('choose');
        if (!syncService.isWebRTCSupported()) {
          useToastStore.getState().showToast('WebRTC not supported in this browser. Device sync will be limited.', 'warning');
        } else {
          useToastStore.getState().showToast('Could not initialize sync service', 'error');
        }
      }
    } catch (error) {
      console.error('Error initializing sync service:', error);
      useToastStore.getState().showToast('Failed to initialize sync', 'error');
      setModalStep('choose');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    setModalStep('creating');
    try {
      setIsLoading(true);
      
      // Try to initialize PeerJS if not already initialized
      const initialized = await syncService.initialize()
        .catch(error => {
          console.error('Error initializing sync service:', error);
          return false;
        });
      
      // Get device ID (will be available regardless of initialization success)
      const myDeviceId = await syncService.getConnectionCode();
      setDeviceId(myDeviceId);
      
      // Update device list
      setDevices([
        {
          id: myDeviceId,
          name: 'This Device',
          status: initialized ? 'Ready' : 'Limited Support',
          isCurrentDevice: true,
          lastActive: Date.now()
        }
      ]);
      
      setIsInitialized(true);
      
      if (initialized) {
        setModalStep('showCode');
        useToastStore.getState().showToast('Your device is ready to connect with others', 'success');
      } else {
        setModalStep('choose');
        if (!syncService.isWebRTCSupported()) {
          useToastStore.getState().showToast('WebRTC not supported in this browser. Device sync will be limited.', 'warning');
        } else {
          useToastStore.getState().showToast('Could not initialize sync service', 'error');
        }
      }
    } catch (error) {
      console.error('Error initializing sync service:', error);
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
      await syncService.connectToDevice(peerCode.trim());
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

  if (!isInitialized) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <YStack alignItems="center" justifyContent="center" flex={1}>
          <ActivityIndicator size="large" color={primaryColor} />
          <Text marginTop="$2" color={isDark ? "#aaa" : "#666"}>
            Initializing sync service...
          </Text>
        </YStack>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <YStack gap="$4" padding={isWeb ? "$4" : "$2"} px={isWeb ? "$4" : "$5"}>
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
          >
            Sync Devices
          </Text>
        </XStack>
        <View 
          style={{ 
            height: 1, 
            backgroundColor: isDark ? '#333' : '#eee',
            marginHorizontal: -16,
            marginBottom: 0
          }} 
        />
        <XStack 
          backgroundColor={isDark ? "#222" : "#f5f5f5"} 
          padding="$3" 
          borderRadius={8}
          alignItems="center"
          justifyContent="space-between"
          width="98%"
        >
          <Text fontSize={14} color={isDark ? "#aaa" : "#666"}>
            Sync Status
          </Text>
          <Text fontSize={14} color={isDark ? currentSpaceId ? "$green10" : "#aaa" : currentSpaceId ? "$green10" : "#666"}>
            {currentSpaceId ? 'Connected' : 'Not Connected'}
          </Text>
        </XStack>
        
        <Text fontSize={16} color={isDark ? "#aaa" : "#666"} marginBottom="$4">
          Connect and synchronize your data across multiple devices. Create a new sync space to start fresh, or join an existing one to share data with your other devices. All changes will be automatically synchronized in real-time.
        </Text>
        
        {isLoading ? (
          <YStack alignItems="center" justifyContent="center" padding="$4">
            <ActivityIndicator size="large" color={primaryColor} />
            <Text marginTop="$2" color={isDark ? "#aaa" : "#666"}>
              {currentSpaceId ? 'Connecting to sync space...' : 'Creating sync space...'}
            </Text>
          </YStack>
        ) : (
          <YStack gap="$2">
            {devices.map((device: any) => (
              <XStack
                key={device.id}
                padding="$3"
                backgroundColor={isDark ? "#222" : "#f5f5f5"}
                borderRadius={8}
                justifyContent="space-between"
                alignItems="center"
                width="98%"
              >
                <YStack>
                  <Text fontSize={16} fontWeight="600" color={isDark ? "#fff" : "#000"}>
                    {device.name}
                  </Text>
                  <Text fontSize={12} color={isDark ? "#aaa" : "#666"}>
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
                      color={isDark ? "#fff" : "#000"} 
                    />
                  </TouchableOpacity>
                )}
              </XStack>
            ))}
          </YStack>
        )}
      </YStack>

      <Button
        size="$4"
        circular
        position="absolute"
        bottom={insets.bottom + 20}
        right={24}
        onPress={() => {
          setShowAddDevice(true);
          if (deviceId) {
            setModalStep('showCode');
          } else {
            setModalStep('choose');
          }
        }}
        backgroundColor={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      {showAddDevice && (
        <BaseCardAnimated
          title={modalStep === 'connected' ? 'Connected Devices' : 'Add New Device'}
          onClose={() => { setShowAddDevice(false); setModalStep(deviceId ? 'showCode' : 'choose'); }}
        >
          <YStack gap="$4" padding="$2">
            {modalStep === 'choose' && (
              <>
                <Text color={isDark ? "#aaa" : "#666"} fontSize={16}>
                  How would you like to sync this device?
                </Text>
                <Button
                  onPress={handleCreateSpace}
                  backgroundColor={isDark ? `${primaryColor}40` : `${primaryColor}20`}
                  borderColor={primaryColor}
                  borderWidth={2}
                  size="$3"
                  height={38}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color={isDark ? "#fff" : primaryColor} fontSize={15} fontWeight="600">
                    Create New Sync Space
                  </Text>
                </Button>
                <Button
                  onPress={handleJoinSpace}
                  backgroundColor={isDark ? "#222" : "#f5f5f5"}
                  borderColor={isDark ? "#444" : "#ddd"}
                  borderWidth={2}
                  size="$3"
                  height={38}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color={isDark ? "#fff" : "#000"} fontSize={15} fontWeight="600">
                    Join Existing Sync Space
                  </Text>
                </Button>
              </>
            )}
            {modalStep === 'creating' && (
              <YStack alignItems="center" justifyContent="center" padding="$4">
                <ActivityIndicator size="large" color={primaryColor} />
                <Text marginTop="$2" color={isDark ? "#aaa" : "#666"}>
                  Initializing your device...
                </Text>
              </YStack>
            )}
            {modalStep === 'showCode' && (
              <YStack backgroundColor={isDark ? "#222" : "#f5f5f5"} padding="$5" borderRadius={8} marginBottom="$4">
                <Text fontSize={14} color={isDark ? "#aaa" : "#666"}>
                  Your Device Code:
                </Text>
                <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                  <Text fontSize={16} fontWeight="600" color={isDark ? "#fff" : "#000"}>
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
                  >
                    Copy
                  </Button>
                </XStack>
                <Text fontSize={12} color={isDark ? "#aaa" : "#666"} marginTop="$2">
                  Share this code with your other devices to connect them.
                </Text>
                <Button
                  onPress={() => setModalStep('connected')}
                  backgroundColor={isDark ? `${primaryColor}40` : `${primaryColor}20`}
                  borderColor={primaryColor}
                  borderWidth={2}
                  size="$3"
                  height={38}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                  marginTop={16}
                >
                  <Text color={isDark ? "#fff" : primaryColor} fontSize={15} fontWeight="600">
                    Done
                  </Text>
                </Button>
              </YStack>
            )}
            {modalStep === 'joining' && (
              <YStack gap="$4" padding="$2">
                <Text color={isDark ? "#aaa" : "#666"} fontSize={16}>
                  Enter the device code from your other device:
                </Text>
                <TextInput
                  style={{
                    backgroundColor: isDark ? '#333' : '#f0f0f0',
                    padding: 12,
                    borderRadius: 8,
                    color: isDark ? '#fff' : '#000',
                    fontSize: 16,
                  }}
                  value={peerCode}
                  onChangeText={setPeerCode}
                  placeholder="Enter device code"
                  placeholderTextColor={isDark ? '#888' : '#aaa'}
                />
                <Button
                  onPress={connectToPeer}
                  backgroundColor={primaryColor}
                  height={50}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                >
                  <Text color="#fff" fontSize={16} fontWeight="600">
                    Connect
                  </Text>
                </Button>
              </YStack>
            )}
            {modalStep === 'connected' && (
              <YStack gap="$2">
                {devices.map((device: any) => (
                  <XStack
                    key={device.id}
                    padding="$3"
                    backgroundColor={isDark ? "#222" : "#f5f5f5"}
                    borderRadius={8}
                    justifyContent="space-between"
                    alignItems="center"
                    width="98%"
                  >
                    <YStack>
                      <Text fontSize={16} fontWeight="600" color={isDark ? "#fff" : "#000"}>
                        {device.name}
                      </Text>
                      <Text fontSize={12} color={isDark ? "#aaa" : "#666"}>
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
                          color={isDark ? "#fff" : "#000"} 
                        />
                      </TouchableOpacity>
                    )}
                  </XStack>
                ))}
                <Button
                  onPress={() => setModalStep('choose')}
                  backgroundColor={isDark ? primaryColor : `${primaryColor}10`}
                  borderColor={primaryColor}
                  borderWidth={2}
                  size="$3"
                  height={38}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                  marginTop={16}
                >
                  <Text color={isDark ? "#fff" : primaryColor} fontSize={15} fontWeight="600">
                    Add Another Device
                  </Text>
                </Button>
                <Button
                  onPress={() => { setShowAddDevice(false); setModalStep(deviceId ? 'showCode' : 'choose'); }}
                  backgroundColor={isDark ? "#222" : "#f5f5f5"}
                  borderColor={isDark ? "#444" : "#ddd"}
                  borderWidth={2}
                  size="$3"
                  height={38}
                  pressStyle={{ scale: 0.97 }}
                  animation="quick"
                  marginTop={8}
                >
                  <Text color={isDark ? "#fff" : "#000"} fontSize={15} fontWeight="600">
                    Close
                  </Text>
                </Button>
              </YStack>
            )}
          </YStack>
        </BaseCardAnimated>
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
