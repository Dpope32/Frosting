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

const devices: any[] = [
  {
    id: '1',
    name: 'Device 1',
    status: 'Connected',
    isCurrentDevice: true,
  },
  {
    id: '2',
    name: 'Device 2',
    status: 'Connected',
    isCurrentDevice: false,
  }
]
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

  useEffect(() => {
    initializeSyncService();
  }, []);

  const initializeSyncService = async () => {
    try {
      setIsLoading(true);
      await syncService.initialize();
      const myDeviceId = syncService.getConnectionCode();
      setDeviceId(myDeviceId);
      
      // Add current device to the list
      setDevices([
        {
          id: myDeviceId,
          name: 'This Device',
          status: 'Connected',
          isCurrentDevice: true,
          lastActive: Date.now()
        }
      ]);
      
      setIsInitialized(true);
    } catch (error) {
      console.error('Error initializing sync service:', error);
      useToastStore.getState().showToast('Failed to initialize sync', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateSpace = async () => {
    // Creating a space is just initializing your device ID as the "space host"
    // Your device ID is already created and initialized
    useToastStore.getState().showToast('Your device is ready to connect with others', 'success');
    setShowAddDevice(false);
  };

  const handleJoinSpace = () => {
    // Show an input dialog for the peer device ID
    setShowAddDevice(false);
    // Display input field for peer code instead
    setShowJoinDialog(true);
  };

  // Add this new state and handler
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  const connectToPeer = async () => {
    if (!peerCode.trim()) {
      useToastStore.getState().showToast('Please enter a valid device code', 'error');
      return;
    }
    
    try {
      setIsLoading(true);
      await syncService.connectToDevice(peerCode.trim());
      
      // Add the peer device to our list
      setDevices(prev => [...prev, {
        id: peerCode.trim(),
        name: 'Connected Device',
        status: 'Connected',
        isCurrentDevice: false,
        lastActive: Date.now()
      }]);
      
      useToastStore.getState().showToast('Successfully connected to device', 'success');
      setShowJoinDialog(false);
    } catch (error) {
      console.error('Failed to connect:', error);
      useToastStore.getState().showToast('Failed to connect to device', 'error');
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
            fontSize={24} 
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
            marginBottom: 16 
          }} 
        />
        <XStack 
          backgroundColor={isDark ? "#222" : "#f5f5f5"} 
          padding="$3" 
          borderRadius={8}
          alignItems="center"
          justifyContent="space-between"
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
        >
          <YStack gap="$4" padding="$4">
            <Text color={isDark ? "#aaa" : "#666"} fontSize={16}>
              Choose how to add a new device:
            </Text>
            <YStack 
              backgroundColor={isDark ? "#222" : "#f5f5f5"} 
              padding="$3" 
              borderRadius={8}
              marginBottom="$4"
            >
              <Text fontSize={14} color={isDark ? "#aaa" : "#666"}>
                Your Device Code:
              </Text>
              <XStack justifyContent="space-between" alignItems="center" marginTop="$2">
                <Text fontSize={16} fontWeight="600" color={isDark ? "#fff" : "#000"}>
                  {deviceId}
                </Text>
                <Button 
                  size="$3" 
                  onPress={async () => {
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
            </YStack>
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