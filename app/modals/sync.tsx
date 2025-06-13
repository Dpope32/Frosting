// app/modals/sync.tsx
import React, { useState } from 'react'
import { View, StyleSheet, useWindowDimensions, Alert, ScrollView, Linking } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, XStack, isWeb } from 'tamagui'
import { useColorScheme } from '@/hooks'
import { useUserStore, useToastStore, useRegistryStore } from '@/store'
import { isIpad } from '@/utils'
import AddDeviceModal from '@/components/cardModals/creates/AddDeviceModal'
import { exportLogs, createOrJoinWorkspace } from '@/sync'
import * as Clipboard from 'expo-clipboard'
import { useAuthCheck, useDeviceId, useWorkspaceId, useWorkspaceDetails, useSyncStatusLogger, useLogUpdates } from '@/hooks/sync'
import { addSyncLog, clearLogQueue, LogEntry, getColors, baseSpacing, PremiumLogs } from '@/components/sync'
import SyncTable from '@/components/sync/syncTable'
import NeedsWorkspace from '@/components/sync/needsWorkspace'
import { leaveWorkspace } from '@/sync/leaveWorkspace'
import { NonPremiumUser } from '@/components/sync/nonpremiumUser'
import { SnapshotSize } from '@/components/sync/SnapshotSize'
import { ModalHeader } from '@/components/shared/ModalHeader'
import { premiumService } from '@/services/premiumService'

// Prevent multiple wrappers of fetch during hot reload
if (!(global as any)._syncFetchWrapped) {
  const originalFetch = global.fetch

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const isPremium = useUserStore.getState().preferences.premium === true
    let url: string = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    
    // Skip logging for yahoo and geocoding requests
    const shouldSkipLogging = 
    url.toLowerCase().includes('yahoo') || url.toLowerCase().includes('geocoding') || 
    url.toLowerCase().includes('weather') || url.toLowerCase().includes('stoic' ) || 
    url.toLowerCase().includes('google') || url.toLowerCase().includes('cloudflare') ||
    url.toLowerCase().includes('health-check') || url.toLowerCase().includes('fedora')
    
    if (isPremium && !shouldSkipLogging) {
      let bodyString = ''
      if (init?.body) {
        try {
          if (typeof init.body === 'string') {
            bodyString = init.body.length > 500 ? init.body.substring(0, 500) + '...'  : init.body
          } 
          else { bodyString = JSON.stringify(init.body).substring(0, 500) }
        } catch { bodyString = '[Unstringifiable body]' }
      }
      addSyncLog(`🌐 Request: ${init?.method || 'GET'} ${url}`, 'info', init?.body ? `Body: ${bodyString}` : undefined)
    }
    try {
      const response = await originalFetch(input, init)
      if (isPremium && !shouldSkipLogging) {
        const cloned = response.clone()
        const contentType = response.headers.get('content-type') || ''
        let details: string | undefined
        if (contentType.includes('application/json')) {
          const data = await cloned.json()
          const s = JSON.stringify(data)
          details =  s.length > 500  ? s.substring(0, 500) + '...' : s
        } else if (contentType.includes('text')) {
          const t = await cloned.text()
          details = t.length > 500  ? t.substring(0, 500) + '...'  : t
        }
        addSyncLog(`📥 Response: ${response.status} from ${url}`, response.ok ? 'success' : 'error', details)
      }
      return response
    } catch (err) {
      if (isPremium && !shouldSkipLogging) {
        addSyncLog(`❌ Network error with ${url}`, 'error', err instanceof Error ? err.message : String(err))
      }
      throw err
    }
  }
  ;(global as any)._syncFetchWrapped = true
}

export default function SyncScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const primaryColor = useUserStore((s) => s.preferences.primaryColor)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [initialModalMode, setInitialModalMode] =useState<'create' | 'join' | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [syncLogs, setSyncLogs] = useState<LogEntry[]>([])
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})
  const premium = useUserStore((s) => s.preferences.premium === true)
  
  // Simplified: only premium users get sync access
  const shouldShowSyncTable = premium;

  const [premiumLoaded, setPremiumLoaded] = useState(false)
  const { width } = useWindowDimensions()
  const colors = getColors(isDark, primaryColor)
  const contentWidth = isWeb ? width * 0.7025 : isIpad() ? Math.min(width - baseSpacing * 2, 600) : Math.min(width - baseSpacing * 2, 350);
  const syncStatus = useRegistryStore((s) => s.syncStatus)
  const { deviceId } = useDeviceId(premium)
  const { workspaceId, setWorkspaceId } = useWorkspaceId(premium)
  const { inviteCode } = useWorkspaceDetails(premium, workspaceId, deviceId)
  
  // Track when premium status has been determined
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setPremiumLoaded(true)
    }, 100) // Small delay to ensure store is hydrated
    return () => clearTimeout(timer)
  }, [])

  useSyncStatusLogger(syncStatus, isLoading)
  useAuthCheck()
  useLogUpdates(premium, setSyncLogs)  

  const toggleDetails = React.useCallback((id: string) => {
    setShowDetails((p) => ({ ...p, [id]: !p[id] }))
  }, [])

  const clearLogsCB = React.useCallback(() => {
    clearLogQueue()
    setSyncLogs([])
  }, [])

  const handleLeaveWorkspace = React.useCallback(() => {
    if (!workspaceId) return
    Alert.alert(
      'Leave Workspace','Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Leave',
          style: 'destructive',
          onPress: async () => {
            setIsLoading(true)
            const ok = await leaveWorkspace(true)
            useToastStore.getState().showToast(
                ok ? 'Left workspace' : 'Failed to leave',
                ok ? 'success' : 'error'
              )
            if (ok) {
              setWorkspaceId(null)
            }
            setIsLoading(false)
          },
        },
      ]
    )
  }, [workspaceId, setWorkspaceId])

  const handleExportLogs = React.useCallback(async () => {
    try {
      await exportLogs(syncLogs)
    } catch (e) {
      addSyncLog('Failed to export logs', 'error', e instanceof Error ? e.message : String(e))
    }
  }, [syncLogs])


  const onWorkspaceUpdated = React.useCallback((id: string, action: 'created' | 'joined') => {
    setShowAddDevice(false)
    setInitialModalMode(undefined)
    setWorkspaceId(id)
    useRegistryStore.getState().setWorkspaceId(id)
    addSyncLog(`Workspace ${action}: ${id}`, 'success')
    useRegistryStore.getState().setSyncStatus('idle')
  }, [setWorkspaceId])

  const handleSignUp = React.useCallback(async () => {
    try {
      await Linking.openURL('https://kaiba.lemonsqueezy.com/');
    } catch (error) {
      useToastStore.getState().showToast('Failed to open signup page', 'error');
    }
  }, []);

  const handleJoinWorkspace = React.useCallback(async (code: string) => {
    setIsLoading(true);
    try {
      addSyncLog(`🔌 Attempting to join workspace with code: ${code}`, 'info');
      
      const result = await createOrJoinWorkspace(undefined, code);
      
      // Set workspace ID in store
      setWorkspaceId(result.id);
      useRegistryStore.getState().setWorkspaceId(result.id);
      
      // Grant premium access when joining a workspace
      const userStore = useUserStore.getState();
      const wasPremium = userStore.preferences.premium === true;
      userStore.setPreferences({ premium: true });
      
      // If user wasn't premium before, trigger initial sync operations
      if (!wasPremium) {
        addSyncLog('🔄 First-time premium activation - initializing sync', 'info');
        // Mark purchase as successful to trigger sync operations
        await premiumService.markPurchaseSuccessful();
      }
      
      addSyncLog(`✅ Successfully joined workspace: ${result.id.slice(0, 8)}`, 'success');
      useToastStore.getState().showToast('Successfully joined workspace!', 'success');
      useRegistryStore.getState().setSyncStatus('idle');
      
    } catch (error) {
      console.error('Failed to join workspace:', error);
      addSyncLog('Failed to join workspace', 'error',
        error instanceof Error ? error.message : String(error));
      useToastStore.getState().showToast('Failed to join workspace', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [setWorkspaceId]);

  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{ paddingTop: isIpad() ? 30 : insets.top, paddingBottom: isWeb ? 100 : isIpad() ? 50 : 25}}
    >
      <YStack gap={baseSpacing * 2} p={isWeb ? '$4' : '$2'} px={isWeb ? '$4' : '$3'} pb={baseSpacing * 6} >
        <ModalHeader title="Sync" isDark={isDark} />

        {shouldShowSyncTable ? (
          <XStack alignItems="center" justifyContent="center" marginBottom={premium && !workspaceId ? -baseSpacing : baseSpacing}>
            <SyncTable
              isDark={isDark}
              primaryColor={primaryColor}
              syncStatus={syncStatus}
              currentSpaceId={workspaceId || ''}
              inviteCode={inviteCode}
              onCopyInviteCode={async () => {
                if (!inviteCode) return;
                await Clipboard.setStringAsync(inviteCode);
                useToastStore.getState().showToast('Invite code copied', 'success');
              }}
              onCopyCurrentSpaceId={async () => {
                if (!workspaceId) return;
                await Clipboard.setStringAsync(workspaceId);
                useToastStore.getState().showToast('Current space ID copied', 'success');
              }}
              onLeaveWorkspace={handleLeaveWorkspace}
            />
          </XStack>
        ) : (
          <XStack alignItems="center" justifyContent="center" marginBottom={baseSpacing}>
            <NonPremiumUser
              colors={colors}
              contentWidth={width}
              onSignUp={handleSignUp}
              onJoinWorkspace={handleJoinWorkspace}
            />
          </XStack>
        )}
        
        {shouldShowSyncTable && premium && workspaceId && (
          <XStack alignItems="center" justifyContent="center" marginBottom={baseSpacing}>
            <SnapshotSize
              contentWidth={contentWidth}
              isDark={isDark}
              primaryColor={primaryColor}
              workspaceId={workspaceId}
            />
          </XStack>
        )}

        {shouldShowSyncTable && premium && !workspaceId && premiumLoaded && (
          <NeedsWorkspace
            isDark={isDark}
            width={contentWidth}
            onPressCreate={() => {
              setInitialModalMode('create')
              setShowAddDevice(true)
            }}
            onPressJoin={() => {
              setInitialModalMode('join')
              setShowAddDevice(true)
            }}
          />
        )}

        {shouldShowSyncTable && premium && (
          <XStack
            alignItems="center"
            justifyContent="center"
            marginVertical={premium && !workspaceId ? -baseSpacing : baseSpacing}
          >
            <View style={{ width: contentWidth }}>
              <PremiumLogs
                isLoading={isLoading}
                syncStatus={syncStatus}
                syncLogs={syncLogs}
                showDetails={showDetails}
                toggleDetails={toggleDetails}
                clearLogs={clearLogsCB}
                exportLogs={handleExportLogs}
                premium={premium}
                devices={[]}
                contentWidth={contentWidth}
                maxHeight={isWeb ? 2000 : isIpad() ? 1000 : 750}
              />
            </View>
          </XStack>
        )}
      </YStack>
    </ScrollView>
            {shouldShowSyncTable && showAddDevice && (
            <AddDeviceModal
              onClose={() => {
                setShowAddDevice(false)
                setInitialModalMode(undefined)
              }}
              initialMode={initialModalMode}
              currentWorkspaceId={workspaceId}
              onWorkspaceCreated={(id: string) => onWorkspaceUpdated(id, 'created')}
              onWorkspaceJoined={(id: string) => onWorkspaceUpdated(id, 'joined')}
            />
          )}
          </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})
