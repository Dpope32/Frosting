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
  // Keep your existing state variables
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
  const username = useUserStore((state) => state.preferences.username);
  const [showJoinDialog, setShowJoinDialog] = useState(false);

  const initializeSyncService = async () => {
    try {
      setIsLoading(true);
      
      // Initialize device ID first - this must happen before anything else
      await syncService.initialize();
      
      // Get the device ID after initialization
      const myDeviceId = syncService.getConnectionCode();
      if (!myDeviceId) {
        throw new Error('Failed to get device ID');
      }
      
      setDeviceId(myDeviceId);
      
      // Add current device to the list
      setDevices([
        {
          id: myDeviceId,
          name: username || 'My Device',
          status: 'Connected',
          isCurrentDevice: true,
          lastActive: Date.now()
        }
      ]);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing sync service:', error);
      useToastStore.getState().showToast('Failed to initialize sync. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    initializeSyncService()
    useToastStore.getState().showToast('Your device is ready to connect with others', 'success');
    setShowAddDevice(false);
  };

  const handleJoinSpace = () => {
    setShowAddDevice(false);
    setShowJoinDialog(true);
  };

  
  const connectToPeer = async () => {
    if (!peerCode || peerCode.trim().length === 0) {
      useToastStore.getState().showToast('Please enter a valid device code', 'warning');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Ensure we're initialized
      if (!isInitialized) {
        await initializeSyncService();
      }
      
      // Try to create an offer to the peer
      try {
        const offerSdp = await syncService.createOffer();
        console.log('Created offer:', offerSdp);
        
        // In a real implementation, you'd send this offer to the peer
        // For now, just show a success message
        useToastStore.getState().showToast('Connection request sent', 'success');
        
        // Add the peer to the devices list
        setDevices(prev => [
          ...prev,
          {
            id: peerCode,
            name: 'Connected Device',
            status: 'Pending',
            isCurrentDevice: false,
            lastActive: Date.now()
          }
        ]);
        
        setCurrentSpaceId(peerCode);
      } catch (error) {
        console.error('Error creating WebRTC offer:', error);
        useToastStore.getState().showToast('Failed to create connection. Please try again.', 'error');
      }
    } catch (error) {
      console.error('Error connecting to peer:', error);
      useToastStore.getState().showToast('Connection failed. Please try again.', 'error');
    } finally {
      setIsLoading(false);
      setShowJoinDialog(false);
    }
  };

  // Check for existing device code when modal opens
  useEffect(() => {
    const checkExistingDevice = async () => {
      if (showAddDevice) {
        const existingId = syncService.getConnectionCode();
        if (existingId) {
          setDeviceId(existingId);
          setIsInitialized(true);
        } else {
          setDeviceId('');
          setIsInitialized(false);
        }
      }
    };
    checkExistingDevice();
  }, [showAddDevice]);

  return (
    <View style={[styles.container, { paddingTop: isIpad() ? insets.top + 20 : insets.top + 10 }]}>
      <YStack gap="$4" padding={isWeb ? "$4" : "$3"}>
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
                    {device.status} • {device.isCurrentDevice ? 'This device' : 'Last active: ' + new Date(device.lastActive).toLocaleDateString()}
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
        onPress={() => setShowAddDevice(true)}
        backgroundColor={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
        icon={<Plus size={24} color="white" />}
      />

      {showAddDevice && (
        <BaseCardAnimated
          title="Add New Device"
          onClose={() => setShowAddDevice(false)}
          showCloseButton={true}
        >
          <YStack gap="$4" padding={isWeb ? "$4" : "$3"}>
            <Text color={isDark ? "#aaa" : "#666"} fontSize={16}>
              Choose how to add a new device:
            </Text>
            {/* Only show device code container after initialization */}
            {isInitialized && (
              <YStack 
                padding="$3" 
                borderRadius={8}
                marginBottom="$4"
              >
                <Text fontSize={14} color={isDark ? "#aaa" : "#666"}>
                  Your Device Code:
                </Text>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-evenly',
                    marginTop: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDark ? "#444" : "#ddd",
                  }}
                >
                  <Text
                    style={{ flex: 1 }}
                    numberOfLines={1}
                    ellipsizeMode="middle"
                    fontSize={16}
                    fontWeight="600"
                    color={isDark ? "#fff" : "#000"}
                  >
                    {deviceId}
                  </Text>
                  <Button
                    size="$3"
                    onPress={async () => {
                      await Clipboard.setStringAsync(deviceId);
                      useToastStore.getState().showToast('Device code copied', 'success');
                    }}
                    style={{ marginLeft: 10, minWidth: 60 }}
                  >
                    Copy
                  </Button>
                </View>
                <Text fontSize={12} color={isDark ? "#aaa" : "#666"} marginTop="$2">
                  Share this code with your other devices to connect them.
                </Text>
              </YStack>
            )}
            {/* Only show the initialize button if not initialized */}
            {!isInitialized && (
              <Button
                onPress={handleCreateSpace}
                backgroundColor={isDark ? `${primaryColor}40` : `${primaryColor}20`}
                borderColor={primaryColor}
                borderWidth={2}
                height={50}
                pressStyle={{ scale: 0.97 }}
                animation="quick"
              >
                <Text
                  color={isDark ? "#fff" : primaryColor}
                  fontSize={16}
                  fontWeight="600"
                >
                  Initialize This Device
                </Text>
              </Button>
            )}
            <Button
              onPress={handleJoinSpace}
              backgroundColor={isDark ? "#222" : "#f5f5f5"}
              borderColor={isDark ? "#444" : "#ddd"}
              borderWidth={2}
              height={50}
              pressStyle={{ scale: 0.97 }}
              animation="quick"
            >
              <Text
                color={isDark ? "#fff" : "#000"}
                fontSize={16}
                fontWeight="600"
              >
                Connect to Another Device
              </Text>
            </Button>
          </YStack>
        </BaseCardAnimated>
      )}

      {showJoinDialog && (
        <BaseCardAnimated
          title="Join Device"
          onClose={() => setShowJoinDialog(false)}
        >
          <YStack gap="$4" padding="$4">
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
              <Text
                color="#fff"
                fontSize={16}
                fontWeight="600"
              >
                Connect
              </Text>
            </Button>
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
