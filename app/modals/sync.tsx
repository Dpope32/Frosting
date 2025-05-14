import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { useRegistryStore } from '@/store/RegistryStore';
import { isIpad } from '@/utils/deviceUtils';
import AddDeviceModal from '@/components/cardModals/creates/AddDeviceModal';
import { exportLogs } from '@/sync/exportLogs';
import { pushSnapshot, pullLatestSnapshot } from '@/sync/snapshotPushPull';
import { exportEncryptedState, generateSyncKey } from '@/sync/registrySyncManager';
import SyncTable from '@/components/sync/syncTable';
import { AUTHORIZED_USERS } from '@/constants/KEYS';
import { baseSpacing, getColors } from '@/components/sync/sharedStyles';
import { PremiumLogs } from '@/components/sync/premiumLogs';
import { 
  addSyncLog, 
  setLogUpdateCallback,
  clearLogQueue,
  LogEntry,
} from '@/components/sync/syncUtils';

// Create a custom fetch to intercept and log all network requests
const originalFetch = global.fetch;
global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  // Only log if user is premium
  const isPremium = useUserStore.getState().preferences.premium === true;
  
  // Fix the URL extraction to handle all input types correctly
  let url: string;
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.toString();
  } else {
    // Must be a Request object
    url = input.url;
  }
  
  // Log request if premium
  if (isPremium) {
    addSyncLog(`🌐 Request: ${init?.method || 'GET'} ${url}`, 'info', 
      init?.body ? `Body: ${JSON.stringify(init?.body)}` : undefined);
  }
  
  try {
    const response = await originalFetch(input, init);
    
    // Only process response logging if premium
    if (isPremium) {
      // Clone the response to get its content
      const clonedResponse = response.clone();
      
      try {
        // Try to parse as JSON first
        const jsonData = await clonedResponse.json();
        addSyncLog(`📥 Response: ${response.status} from ${url}`, 
          response.ok ? 'success' : 'error',
          `Data: ${JSON.stringify(jsonData).substring(0, 500)}${JSON.stringify(jsonData).length > 500 ? '...' : ''}`);
      } catch (e) {
        // If not JSON, get text
        const textData = await clonedResponse.clone().text();
        addSyncLog(`📥 Response: ${response.status} from ${url}`, 
          response.ok ? 'success' : 'error',
          textData.length > 0 ? `${textData.substring(0, 500)}${textData.length > 500 ? '...' : ''}` : undefined);
      }
    }
    
    return response;
  } catch (error) {
    // Log network errors if premium
    if (isPremium) {
      addSyncLog(`❌ Network error with ${url}`, 'error', 
        error instanceof Error ? error.message : String(error));
    }
    throw error;
  }
};

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
  const [syncLogs, setSyncLogs] = useState<Array<{id: string; message: string; timestamp: Date; status: 'info' | 'success' | 'error' | 'verbose' |'warning'; details?: string}>>([]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const premium = useUserStore((state) => state.preferences.premium === true);
  const username = useUserStore((state) => state.preferences.username) || 'unknown';
  const setPreferences = useUserStore((state) => state.setPreferences);
  const { width } = useWindowDimensions();
  const colors = getColors(isDark, primaryColor);
  const contentWidth = Math.min(width - baseSpacing * 2, 420);
  const syncStatus = useRegistryStore((state) => state.syncStatus);
  
  // Check authorization on component mount and when premium/username changes
  useEffect(() => {
    // Verify if current user should have premium access
    const trimmedUsername = username.trim();
    const isAuthorized = AUTHORIZED_USERS.some(user => user === trimmedUsername);
    
    console.log('Authorization check:', {
      username,
      trimmedUsername,
      premium,
      isAuthorized
    });
    
    // If premium is enabled but user is not authorized, disable premium
    if (premium && !isAuthorized) {
      console.log('REVOKING premium for unauthorized user:', username);
      Alert.alert(
        "Premium Access Removed",
        "Your account is not authorized for premium sync. Contact the developer to request access.",
        [{ 
          text: "OK", 
          onPress: () => setPreferences({ premium: false }) 
        }]
      );
    }
  }, [premium, username, setPreferences]);
  
  
  useEffect(() => {
    // Log premium status on component mount
    console.log('Premium status:', premium, 'Username:', username);
  
    setLogUpdateCallback(premium
      ? (logs: LogEntry[]) => {
        setSyncLogs(logs);
      }
      : null);
  
    const fetchDeviceId = async () => {
      if (!premium) return;
      try {
        const id = await generateSyncKey();
        setDeviceId(id);
        addSyncLog(`Device ID generated: ${id.substring(0, 10)}...`, 'info');
      } catch (error) {
        addSyncLog(
          'Failed to generate device ID',
          'error',
          error instanceof Error ? error.message : String(error)
        );
      }
    };
  
    if (premium) {
      fetchDeviceId();
    } else {
      setDeviceId('');
      clearLogQueue();
      setSyncLogs([]);
    }
  
    return () => {
      setLogUpdateCallback(null);
    };
  }, [premium, username]);
  
  // Monitor sync status changes
  useEffect(() => {
    if (syncStatus === 'error') {
      addSyncLog('Sync error detected', 'error');
    } else if (syncStatus === 'syncing') {
      addSyncLog('Sync in progress...', 'info');
    } else if (syncStatus === 'idle' && isLoading) {
      addSyncLog('Sync completed successfully', 'success');
      setIsLoading(false);
    }
  }, [syncStatus, isLoading]);

  /**
   * Perform a real sync using the actual pocketSync functions
   */
  const performSync = async (syncType: 'push' | 'pull' | 'both') => {
    if (!premium) {
      useToastStore.getState().showToast('Premium required for sync', 'error');
      return;
    }
    
    setIsLoading(true);
    addSyncLog(`🚀 Starting ${syncType.toUpperCase()} sync`, 'info');
    
    try {
      // First export the encrypted state (required for push)
      if (syncType === 'push' || syncType === 'both') {
        addSyncLog('🗄️  Exporting & encrypting state', 'info');
        const allStates = useRegistryStore.getState().getAllStoreStates();
        await exportEncryptedState(allStates);
        addSyncLog('🔐 State encrypted & saved', 'success');
        
        // Push to remote
        addSyncLog('📤 Pushing snapshot → server', 'info');
        await pushSnapshot();
        addSyncLog('✅ Snapshot push success', 'success');
      }
      
      // Pull from remote if requested
      if (syncType === 'pull' || syncType === 'both') {
        addSyncLog('📥 Pulling latest snapshot ← server', 'info');
        await pullLatestSnapshot();
        addSyncLog('✅ Snapshot pull success', 'success');
      }
      
      // Finalize
      addSyncLog(`${syncType.toUpperCase()} sync finished OK`, 'success');
    } catch (error) {
      addSyncLog(
        '🔥 performSync() aborted with error',
        'error',
        error instanceof Error ? error.message : String(error)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle log details visibility
  const toggleDetails = (logId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  };
  
  // Clear logs
  const clearLogs = () => {
    clearLogQueue();
    setSyncLogs([]);
  };

  const handlePremiumToggle = () => {
    // Debug log of current state
    console.log('TOGGLE - Current premium:', premium, 'Username:', username);
    
    if (!premium) {
      // Use the centralized list of authorized users
      const trimmedUsername = username.trim();
      const isAuthorized = AUTHORIZED_USERS.some(user => user === trimmedUsername);
      
      console.log('User attempting premium access:', {
        username,
        trimmedUsername,
        authorizedUsers: AUTHORIZED_USERS,
        isAuthorized
      });
      
      if (isAuthorized) {
        console.log('Access granted for:', username);
        setPreferences({ premium: true });
        useToastStore.getState().showToast('Premium sync enabled!', 'success');
      } else {
        console.log('Access denied for:', username);
        Alert.alert(
          "Premium Access Restricted",
          "Contact the Developer to add your name to the sync list!",
          [{ text: "OK", style: "default" }]
        );
      }
    } else if (!isLoading) {
      performSync('both');
    }
  };
  
  // This function handles the button press specifically
  const handleSyncButtonPress = () => {
    console.log('Sync button pressed - checking premium status');
    handlePremiumToggle();
  };

  /**
   * Zero-arg wrapper for exporting logs so it matches the
   * `exportLogs: () => void` signature expected by <PremiumLogs/>.
   */
  const handleExportLogs = async () => {
    try {
      await exportLogs(syncLogs);
    } catch (error) {
      addSyncLog(
        'Failed to export logs',
        'error',
        error instanceof Error ? error.message : String(error),
      );
    }
  };

  /* ------------------------------------------------------------------ */
  /*                        LIFE-CYCLE LOGGING                          */
  /* ------------------------------------------------------------------ */

  // ➋  – screen mount / un-mount
  useEffect(() => {
    addSyncLog('📱 SyncScreen mounted', 'verbose');
    return () => addSyncLog('👋 SyncScreen un-mounted', 'verbose');
  }, []);

  /* ------------------------------------------------------------------ */
  /*                     SYNC STATUS CHANGE WATCHER                     */
  /* ------------------------------------------------------------------ */

  useEffect(() => {
    addSyncLog(`🔄 syncStatus ➜ ${syncStatus}`, 'verbose');

    if (syncStatus === 'error') {
      // cast to any so TS stops complaining
      const lastErr: any = (useRegistryStore.getState() as any).lastError;
      addSyncLog(
        '❌ Sync error detected',
        'error',
        lastErr ? JSON.stringify(lastErr).slice(0, 500) : undefined
      );
    } else if (syncStatus === 'syncing') {
      addSyncLog('🚚 Sync in progress…', 'info');
    } else if (syncStatus === 'idle' && isLoading) {
      addSyncLog('✅ Sync completed – status returned to idle', 'success');
      setIsLoading(false);
    }
  }, [syncStatus, isLoading]);

  return (
    <View style={[styles.container, { backgroundColor: colors.bg, paddingTop: isIpad() ? 30 : insets.top, marginBottom: baseSpacing * 2 }]}>
      <YStack gap={baseSpacing * 2} padding={isWeb ? "$4" : "$2"} px={isWeb ? "$4" : "$3"}>
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
        <XStack alignItems="center" justifyContent="center">
          <SyncTable isDark={isDark} primaryColor={primaryColor} syncStatus={syncStatus} currentSpaceId={currentSpaceId || ''} deviceId={deviceId} />
        </XStack>

        {premium && (
            <PremiumLogs 
              isLoading={isLoading} 
              syncStatus={syncStatus} 
              syncLogs={syncLogs} 
              showDetails={showDetails} 
              toggleDetails={toggleDetails} 
              clearLogs={clearLogs} 
              exportLogs={handleExportLogs}
              performSync={performSync} 
              handleSyncButtonPress={handleSyncButtonPress} 
              premium={premium} 
              devices={devices} 
              contentWidth={contentWidth} 
            />
        )}
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
    marginBottom: 100,
  },
  backButton: {
    position: 'absolute',
    left: 0,
    padding: 8,
    zIndex: 1,
  },
});
