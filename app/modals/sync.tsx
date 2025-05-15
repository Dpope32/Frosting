import React, { useState, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text, YStack, XStack, isWeb } from 'tamagui';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
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
import { 
  getCurrentWorkspaceId as getWsIdUtil,
  leaveWorkspace 
} from '@/sync/workspace';
import NeedsWorkspace from '@/components/sync/needsWorkspace';
import * as Clipboard from 'expo-clipboard';
import { getPocketBase } from '@/sync/pocketSync';
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
    let bodyString = '';
    
    if (init?.body) {
      try {
        if (init.body instanceof FormData) {
          bodyString = '[FormData object]';
        } else if (typeof init.body === 'string') {
          // If body is already a string, use it directly but truncate if needed
          bodyString = init.body.length > 500 ? init.body.substring(0, 500) + '...' : init.body;
        } else if (init.body instanceof Blob || init.body instanceof ArrayBuffer) {
          bodyString = '[Binary data]';
        } else {
          // Try to stringify other object types
          bodyString = JSON.stringify(init.body).substring(0, 500);
          if (bodyString.length >= 500) bodyString += '...';
        }
      } catch (e) {
        bodyString = '[Unstringifiable body]';
      }
    }
    
    addSyncLog(`🌐 Request: ${init?.method || 'GET'} ${url}`, 'info', 
      init?.body ? `Body: ${bodyString}` : undefined);
  }
  
  try {
    const response = await originalFetch(input, init);
    
    // Only process response logging if premium
    if (isPremium) {
      // Clone the response to get its content
      const clonedResponse = response.clone();
      
      try {
        const contentType = response.headers.get('content-type') || '';
        
        if (contentType.includes('application/json')) {
          // Try to parse as JSON
          const jsonData = await clonedResponse.json();
          const truncatedData = JSON.stringify(jsonData);
          const displayData = truncatedData.length > 500 
            ? truncatedData.substring(0, 500) + '...' 
            : truncatedData;
          
          addSyncLog(`📥 Response: ${response.status} from ${url}`, 
            response.ok ? 'success' : 'error',
            `Data: ${displayData}`);
        } else if (contentType.includes('text')) {
          // Get text for text content types
          const textData = await clonedResponse.text();
          const displayText = textData.length > 500 
            ? textData.substring(0, 500) + '...' 
            : textData;
          
          addSyncLog(`📥 Response: ${response.status} from ${url}`, 
            response.ok ? 'success' : 'error',
            textData.length > 0 ? displayText : undefined);
        } else {
          // For binary or other types
          addSyncLog(`📥 Response: ${response.status} from ${url} (${contentType})`, 
            response.ok ? 'success' : 'error');
        }
      } catch (e) {
        // If parsing fails
        addSyncLog(`📥 Response: ${response.status} from ${url} (parsing error)`, 
          response.ok ? 'success' : 'error',
          e instanceof Error ? e.message : String(e));
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
  const contentWidth = Math.min(width - baseSpacing * 2, 350);
  const syncStatus = useRegistryStore((state) => state.syncStatus);
  const [workspaceInviteCode, setWorkspaceInviteCode] = useState<string | null>(null);
  
  // Define fontSizes locally since import is causing issues
  const fontSizes = {
    xs: 10,
    sm: 12,
    md: 14,
    lg: 16,
    xl: 18
  };
  
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

  useEffect(() => {
    const fetchInitialWorkspaceId = async () => {
      if (premium) { 
        try {
          // Uses the correctly imported and aliased function
          const id = await getWsIdUtil(); 
          if (id) {
            setCurrentSpaceId(id);
            addSyncLog(`🔗 SyncScreen: Initial workspace ID loaded: ${id.substring(0,8)}`, 'info');
          } else {
            setCurrentSpaceId(null); 
            addSyncLog('🔩 SyncScreen: No initial workspace ID found for premium user.', 'verbose');
          }
        } catch (error) {
          setCurrentSpaceId(null); 
          addSyncLog(
            '🔥 SyncScreen: Failed to fetch initial workspace ID', 
            'error', 
            error instanceof Error ? error.message : String(error)
          );
        }
      } else {
        setCurrentSpaceId(null); 
        addSyncLog('🚫 SyncScreen: User not premium, skipping initial workspace ID fetch.', 'verbose');
      }
    };
    fetchInitialWorkspaceId();
  }, [premium]); // Re-run if premium status changes

  /**
   * Perform a real sync using the actual pocketSync functions
   */
  const performSync = React.useCallback(async (syncType: 'push' | 'pull' | 'both') => {
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
  }, [premium]);

  // Toggle log details visibility with useCallback
  const toggleDetails = React.useCallback((logId: string) => {
    setShowDetails(prev => ({
      ...prev,
      [logId]: !prev[logId]
    }));
  }, []);
  
  // Clear logs with useCallback
  const clearLogs = React.useCallback(() => {
    clearLogQueue();
    setSyncLogs([]);
  }, []);

  const handlePremiumToggle = React.useCallback(() => {
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
  }, [premium, username, isLoading, performSync]);
  
  // This function handles the button press specifically
  const handleSyncButtonPress = React.useCallback(() => {
    console.log('Sync button pressed - checking premium status');
    handlePremiumToggle();
  }, [handlePremiumToggle]);

  const handleExportLogs = React.useCallback(async () => {
    try {
      await exportLogs(syncLogs);
    } catch (error) {
      addSyncLog(
        'Failed to export logs',
        'error',
        error instanceof Error ? error.message : String(error),
      );
    }
  }, [syncLogs]);

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

  // Check if user needs to create/join a workspace
  const needsWorkspace = premium && !currentSpaceId;

  // New function to handle leaving workspace
  const handleLeaveWorkspace = React.useCallback(async () => {
    if (!currentSpaceId) return;
    
    Alert.alert(
      "Leave Workspace",
      "Are you sure you want to leave this workspace? Your device will no longer receive sync updates.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Leave",
          style: "destructive",
          onPress: async () => {
            try {
              addSyncLog("User confirmed leaving workspace", "info");
              setIsLoading(true);
              
              const success = await leaveWorkspace(true);
              
              if (success) {
                setCurrentSpaceId(null);
                useToastStore.getState().showToast("Successfully left workspace", "success");
              } else {
                useToastStore.getState().showToast("Failed to leave workspace", "error");
              }
            } catch (error) {
              addSyncLog(
                "Error leaving workspace",
                "error",
                error instanceof Error ? error.message : String(error)
              );
              useToastStore.getState().showToast("Error leaving workspace", "error");
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  }, [currentSpaceId]);

  // Fetch workspace invite code when currentSpaceId changes
  useEffect(() => {
    const fetchWorkspaceDetails = async () => {
      if (!premium || !currentSpaceId) {
        setWorkspaceInviteCode(null);
        return;
      }
      
      try {
        addSyncLog('🔍 Fetching workspace details', 'verbose');
        const pb = await getPocketBase();
        const workspace = await pb.collection('sync_workspaces').getOne(currentSpaceId);
        
        if (workspace && workspace.invite_code) {
          setWorkspaceInviteCode(workspace.invite_code);
          addSyncLog('✅ Workspace invite code retrieved', 'verbose');
        } else {
          setWorkspaceInviteCode(null);
          addSyncLog('⚠️ Workspace has no invite code', 'warning');
        }
      } catch (error) {
        setWorkspaceInviteCode(null);
        addSyncLog(
          '❌ Failed to fetch workspace details', 
          'error',
          error instanceof Error ? error.message : String(error)
        );
      }
    };
    
    fetchWorkspaceDetails();
  }, [premium, currentSpaceId]);

  // Copy invite code to clipboard
  const copyInviteCode = React.useCallback(async () => {
    if (!workspaceInviteCode) return;
    
    try {
      await Clipboard.setStringAsync(workspaceInviteCode);
      useToastStore.getState().showToast('Invite code copied to clipboard', 'success');
      addSyncLog('📋 Workspace invite code copied to clipboard', 'verbose');
    } catch (error) {
      useToastStore.getState().showToast('Failed to copy invite code', 'error');
      addSyncLog(
        '❌ Failed to copy invite code', 
        'error',
        error instanceof Error ? error.message : String(error)
      );
    }
  }, [workspaceInviteCode]);

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.bg }]} 
      contentContainerStyle={{ 
        paddingTop: isIpad() ? 30 : insets.top,
        paddingBottom: 100, 
      }}
    >
      <YStack gap={baseSpacing * 2} padding={isWeb ? "$4" : "$2"} px={isWeb ? "$4" : "$3"} paddingBottom={baseSpacing * 6}>
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
          <SyncTable 
            isDark={isDark} 
            primaryColor={primaryColor} 
            syncStatus={syncStatus} 
            currentSpaceId={currentSpaceId || ''} 
            deviceId={deviceId} 
            inviteCode={workspaceInviteCode}
            onCopyInviteCode={copyInviteCode}
          />
        </XStack>
        
        {currentSpaceId && premium && (
          <XStack alignItems="center" justifyContent="center" marginTop={0}>
            <TouchableOpacity onPress={handleLeaveWorkspace}>
              <Text 
                color={colors.error || "#f44336"} 
                fontSize={fontSizes.sm} 
                fontWeight="500"
                textAlign="center"
                marginBottom={baseSpacing}
              >
                Leave Workspace
              </Text>
            </TouchableOpacity>
          </XStack>
        )}

        {needsWorkspace && (
          <NeedsWorkspace 
            isDark={isDark}
            onPressCreate={() => setShowAddDevice(true)}
            onPressJoin={() => setShowAddDevice(true)}
          />
        )}

        {premium && (
          <XStack alignItems="center" justifyContent="center" marginTop={baseSpacing * 2}>
            <View style={{ width: contentWidth }}>
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
                maxHeight={350} 
              />
            </View>
          </XStack>
        )}
      </YStack>

      {showAddDevice && (
        <AddDeviceModal 
          onClose={() => setShowAddDevice(false)} 
          currentWorkspaceId={currentSpaceId}
          onWorkspaceCreated={(id, inviteCode) => {
            setCurrentSpaceId(id);
            setWorkspaceInviteCode(inviteCode);
            addSyncLog(`Workspace created in AddDeviceModal: ${id}`, "success");
          }}
          onWorkspaceJoined={(id) => {
            setCurrentSpaceId(id);
            addSyncLog(`Workspace joined in AddDeviceModal: ${id}`, "success");
          }}
        />
      )}
    </ScrollView>
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
  // Add new styles for workspace button
  noWorkspaceContainer: {
    width: '100%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: 'center',
  },
  addWorkspaceButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
