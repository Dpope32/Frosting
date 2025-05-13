import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, useWindowDimensions, Animated, ScrollView, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, Button, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useRouter } from 'expo-router';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { useRegistryStore } from '@/store/RegistryStore';
import { isIpad } from '@/utils/deviceUtils';
import AddDeviceModal from '@/components/cardModals/creates/AddDeviceModal';
import { pushSnapshot, pullLatestSnapshot } from '@/sync/pocketSync';
import { exportEncryptedState, generateSyncKey } from '@/sync/registrySyncManager';
import * as Sentry from '@sentry/react-native';
import SyncTable from '@/components/sync/syncTable';
import { AUTHORIZED_USERS } from '@/constants/KEYS';

// Create a global log capture system that logs will be pushed to
let globalLogQueue: Array<{id: string; message: string; timestamp: Date; status: 'info' | 'success' | 'error' | 'warning'; details?: string}> = [];
let logUpdateCallback: ((logs: typeof globalLogQueue) => void) | null = null;

// Override console methods to capture logs
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

// Custom function to add logs to our queue with context
export const addSyncLog = (message: string, status: 'info' | 'success' | 'error' | 'warning', details?: string) => {
  const log = {
    id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
    message,
    timestamp: new Date(),
    status,
    details
  };
  
  globalLogQueue = [...globalLogQueue, log];
  
  // Call the callback if set
  if (logUpdateCallback) {
    logUpdateCallback(globalLogQueue);
  }
  
  // Also log to original console
  if (status === 'error') {
    originalConsoleError(message, details || '');
  } else if (status === 'warning') {
    originalConsoleWarn(message, details || '');
  } else {
    originalConsoleLog(message, details || '');
  }
  
  // Also send to Sentry for monitoring
  Sentry.addBreadcrumb({
    category: 'syncUI',
    message,
    data: details ? { details } : undefined,
    level: status as any,
  });
};

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
  const [syncLogs, setSyncLogs] = useState<Array<{id: string; message: string; timestamp: Date; status: 'info' | 'success' | 'error' | 'warning'; details?: string}>>([]);
  const [showDetails, setShowDetails] = useState<{[key: string]: boolean}>({});
  const fadeAnims = useRef<{[key: string]: Animated.Value}>({});
  const [modalStep, setModalStep] = useState<'choose' | 'creating' | 'showCode' | 'joining' | 'connected'>('choose');
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
  
  // Log username on mount for debugging
  useEffect(() => {
    console.log('Component mounted with username:', username);
  }, []);
  
  // Set up log subscription
  useEffect(() => {
    // Log premium status on component mount
    console.log('Premium status:', premium, 'Username:', username);
    
    // Only set the callback if premium
    logUpdateCallback = premium ? (logs) => {
      setSyncLogs([...logs]);
    } : null;
    
    // Get device ID on mount only if premium
    const fetchDeviceId = async () => {
      // Skip entirely if not premium
      if (!premium) {
        console.log('Skipping device ID generation - user is not premium');
        return;
      }
      
      try {
        console.log('Generating device ID for premium user');
        const id = await generateSyncKey();
        setDeviceId(id);
        // Log only if still premium (could have changed during async operation)
        if (premium) {
          addSyncLog(`Device ID generated: ${id.substring(0, 10)}...`, 'info');
        }
      } catch (error) {
        if (premium) {
          addSyncLog('Failed to generate device ID', 'error', 
            error instanceof Error ? error.message : String(error));
        }
      }
    };
    
    // Only fetch deviceId if premium
    if (premium) {
      fetchDeviceId();
    } else {
      // Reset device ID if not premium
      setDeviceId('');
    }
    
    // Clear logs if not premium
    if (!premium) {
      globalLogQueue = [];
      setSyncLogs([]);
    }
    
    // Clean up logging on unmount
    return () => {
      logUpdateCallback = null;
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
    addSyncLog(`Starting ${syncType} sync process...`, 'info');
    
    try {
      // First export the encrypted state (required for push)
      if (syncType === 'push' || syncType === 'both') {
        addSyncLog('Exporting and encrypting state...', 'info');
        const allStates = useRegistryStore.getState().getAllStoreStates();
        await exportEncryptedState(allStates);
        
        // Push to remote
        addSyncLog('Pushing snapshot to server...', 'info');
        await pushSnapshot();
      }
      
      // Pull from remote if requested
      if (syncType === 'pull' || syncType === 'both') {
        addSyncLog('Pulling latest snapshot from server...', 'info');
        await pullLatestSnapshot();
      }
      
      // Finalize
      addSyncLog(`${syncType.toUpperCase()} sync completed successfully`, 'success');
    } catch (error) {
      addSyncLog(`Sync failed`, 'error', 
        error instanceof Error ? error.message : String(error));
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
    globalLogQueue = [];
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
        <XStack>
          <SyncTable isDark={isDark} primaryColor={primaryColor} syncStatus={syncStatus} currentSpaceId={currentSpaceId || ''} deviceId={deviceId} />
        </XStack>

        {premium && (
          <YStack alignItems="center" justifyContent="center" padding={0} marginTop={baseSpacing}>
            <XStack alignItems="center" gap={baseSpacing} marginBottom={0}>
              {isLoading && <ActivityIndicator size="small" color={colors.accent} />}
              {isLoading && (
                <Text fontSize={fontSizes.xs} color={colors.subtext}>
                  {syncStatus === 'syncing' ? 'Sync in progress...' : 'Preparing sync...'}
                </Text>
              )}
            </XStack>
            
            <View style={{
              width: contentWidth,
              marginTop: 0,
              backgroundColor: colors.card,
              borderRadius: cardRadius,
              borderWidth: 1,
              borderColor: colors.border,
              padding: baseSpacing * 2,
              maxHeight: 800,
            }}>
              <XStack alignItems="center" justifyContent="space-between" marginBottom={baseSpacing}>
                <Text fontSize={fontSizes.md} color={colors.text} fontWeight="600">
                  Sync Progress Log
                </Text>
                {syncLogs.length > 0 && (
                  <TouchableOpacity onPress={clearLogs}>
                    <Text fontSize={fontSizes.xs} color={colors.accent}>
                      Clear Logs
                    </Text>
                  </TouchableOpacity>
                )}
              </XStack>
              <View style={{height: 1, backgroundColor: colors.border, marginBottom: baseSpacing * 2}} />
              
              <ScrollView 
                style={{ maxHeight: 400 }}
                contentContainerStyle={{ paddingBottom: baseSpacing * 3 }}
                showsVerticalScrollIndicator={true}
              > 
                <YStack gap={baseSpacing} alignItems="flex-start">
                  {syncLogs.map((log) => {
                  if (!fadeAnims.current[log.id]) {
                    fadeAnims.current[log.id] = new Animated.Value(0);
                    Animated.timing(fadeAnims.current[log.id], {
                      toValue: 1,
                      duration: 500,
                      useNativeDriver: true,
                    }).start();
                  }
                  let icon = '🔄';
                  let textColor = colors.text;
                  
                  switch(log.status) {
                    case 'success':
                      icon = '✅';
                      textColor = colors.success;
                      break;
                    case 'error':
                      icon = '❌';
                      textColor = colors.error;
                      break;
                    case 'warning':
                      icon = '⚠️';
                      textColor = isDark ? '#F39C12' : '#D35400';
                      break;
                    default:
                      icon = '🔄';
                      break;
                  }
                  
                  return (
                    <Animated.View 
                      key={log.id} 
                      style={{
                        opacity: fadeAnims.current[log.id],
                        width: '100%',
                      }}
                    >
                      <TouchableOpacity 
                        onPress={() => log.details && toggleDetails(log.id)}
                        style={{
                          flexDirection: 'row',
                          alignItems: 'flex-start',
                        }}
                      >
                        <Text fontSize={fontSizes.md} marginRight={baseSpacing / 2}>
                          {icon}
                        </Text>
                        <YStack flex={1}>
                          <Text fontSize={fontSizes.sm} color={textColor} fontWeight="500">
                            {log.message}
                          </Text>
                          <Text fontSize={fontSizes.xs} color={colors.subtext}>
                            {log.timestamp.toLocaleTimeString()} · {Math.floor((Date.now() - log.timestamp.getTime()) / 1000)}s ago
                            {log.details && ' · Tap for details'}
                          </Text>
                          
                          {log.details && showDetails[log.id] && (
                            <View style={{
                              backgroundColor: isDark ? '#1E1E1E' : '#F0F0F0',
                              padding: baseSpacing,
                              borderRadius: 6,
                              marginTop: baseSpacing / 2,
                              marginBottom: baseSpacing / 2,
                              maxHeight: 300, 
                            }}>
                              <ScrollView>
                                <Text fontSize={fontSizes.xs} color={colors.subtext} fontFamily="$body">
                                  {log.details}
                                </Text>
                              </ScrollView>
                            </View>
                          )}
                        </YStack>
                      </TouchableOpacity>
                    </Animated.View>
                  );
                })}
                
                {syncLogs.length === 0 && (
                  <Text fontSize={fontSizes.sm} color={colors.subtext} alignSelf="center" textAlign="center" padding={baseSpacing * 2}>
                    {isLoading ? 'Waiting for sync to start...' : 'Click one of the sync buttons below to begin'}
                  </Text>
                )}
                </YStack>
              </ScrollView>
            </View>
          

            <YStack 
              alignItems="center"
              marginTop={baseSpacing * 2}
              marginBottom={baseSpacing * 2}
              gap={baseSpacing}
              width={contentWidth}
            >
              <XStack gap={baseSpacing} width="100%">
                <Button
                  flex={1}
                  height={40}
                  backgroundColor={isDark ? "rgba(59, 130, 246, 0.10)" : "rgba(30, 64, 175, 0.4)"}
                  borderColor={"rgba(59, 130, 246, 0.5)"}
                  fontFamily="$body"
                  br={8}
                  borderWidth={1}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  scale={1}
                  opacity={isLoading ? 0.5 : 1}
                  onPress={() => !isLoading && performSync('push')}
                  disabled={isLoading}
                >
                  <XStack alignItems="center" gap={4} justifyContent="center">
                    <MaterialIcons name="upload" size={14} color={isDark ? "#60a5fa" : "#60a5fa"} />
                    <Text color={isDark ? "#60a5fa" : "#60a5fa"} fontSize={13} fontWeight="500" fontFamily="$body">
                      Push
                    </Text>
                  </XStack>
                </Button>
                <Button
                  flex={1}
                  height={40}
                  backgroundColor={isDark ? "rgba(139, 92, 246, 0.10)" : "rgba(91, 33, 182, 0.4)"}
                  borderColor={"rgba(139, 92, 246, 0.5)"}
                  fontFamily="$body"
                  br={8}
                  borderWidth={1}
                  alignItems="center"
                  justifyContent="center"
                  pressStyle={{ opacity: 0.7 }}
                  scale={1}
                  opacity={isLoading ? 0.5 : 1}
                  onPress={() => !isLoading && performSync('pull')}
                  disabled={isLoading}
                >
                  <XStack alignItems="center" gap={4} justifyContent="center">
                    <MaterialIcons name="download" size={14} color={isDark ? "#a78bfa" : "#a78bfa"} />
                    <Text color={isDark ? "#a78bfa" : "#a78bfa"} fontSize={13} fontWeight="500" fontFamily="$body">
                      Pull
                    </Text>
                  </XStack>
                </Button>
              </XStack>
              
              <Button
                width="100%"
                height={40}
                backgroundColor={isDark ? "rgba(16, 185, 129, 0.10)" : "rgba(6, 95, 70, 0.7)"}
                borderColor={"rgba(16, 185, 129, 0.5)"}
                fontFamily="$body"
                br={8}
                borderWidth={1}
                alignItems="center"
                justifyContent="center"
                pressStyle={{ opacity: 0.7 }}
                scale={1}
                onPress={handleSyncButtonPress}
                opacity={isLoading ? 0.5 : 1}
                disabled={premium && isLoading}
              >
                <XStack alignItems="center" gap={4} justifyContent="center">
                  {isLoading ? (
                    <ActivityIndicator size="small" color="#4ade80" />
                  ) : (
                    <Ionicons name="water-outline" size={14} color="#4ade80" />
                  )}
                  <Text color="#4ade80" fontSize={13} fontWeight="500" fontFamily="$body">
                    {!premium 
                      ? 'Request Sync Access' 
                      : isLoading 
                      ? 'Syncing...' 
                      : 'Sync Now (Push & Pull)'}
                  </Text>
                </XStack>
              </Button>
            </YStack>

            {devices.length > 0 && (
              <YStack gap={baseSpacing} marginTop={baseSpacing * 4}>
                <Text fontSize={fontSizes.md} color={colors.text} fontWeight="600" marginBottom={baseSpacing}>
                  Connected Devices
                </Text>
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
          </YStack>
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
