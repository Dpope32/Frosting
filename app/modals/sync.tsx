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
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const [showAddDevice, setShowAddDevice] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    loadCurrentSpace();
  }, []);

  const loadCurrentSpace = async () => {
    try {

      setIsInitialized(true);
    } catch (error) {
      console.error('Error loading sync space:', error);
      useToastStore.getState().showToast('Failed to load sync space', 'error');
    }
  };

  const handleCreateSpace = async () => {
    setIsLoading(true);
    try {
      await loadCurrentSpace();
    } catch (error) {
      console.error('Error creating sync space:', error);
      useToastStore.getState().showToast('Failed to create sync space', 'error');
    } finally {
      setIsLoading(false);
      setShowAddDevice(false);
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
                Create New Sync Space
              </Text>
            </Button>
            <Button
              onPress={() => {
                // TODO: Implement QR code scanner or input field for space ID
                setShowAddDevice(false);
              }}
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
                Join Existing Sync Space
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