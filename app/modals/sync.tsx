// app/modals/sync.tsx
import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, useWindowDimensions, Alert, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Text, YStack, XStack, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks/useColorScheme'
import { useRouter } from 'expo-router'
import { useUserStore, useToastStore, useRegistryStore } from '@/store'
import { isIpad } from '@/utils'
import AddDeviceModal from '@/components/cardModals/creates/AddDeviceModal'
import { exportLogs, pullLatestSnapshot, pushSnapshot, exportEncryptedState } from '@/sync'
import * as Clipboard from 'expo-clipboard'
import { useAuthCheck, useDeviceId, useWorkspaceId, useWorkspaceDetails, useSyncStatusLogger, useLogUpdates, useLifecycleLogger } from '@/hooks/sync'
import { addSyncLog, clearLogQueue, LogEntry, getColors, baseSpacing, PremiumLogs } from '@/components/sync'
import SyncTable from '@/components/sync/syncTable'
import NeedsWorkspace from '@/components/sync/needsWorkspace'
import { leaveWorkspace } from '@/sync/leaveWorkspace'

// Prevent multiple wrappers of fetch during hot reload
if (!(global as any)._syncFetchWrapped) {
  const originalFetch = global.fetch

  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const isPremium = useUserStore.getState().preferences.premium === true
    let url: string = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url
    if (isPremium) {
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
      if (isPremium) {
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
      if (isPremium) {
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
  const router = useRouter()
  const primaryColor = useUserStore((s) => s.preferences.primaryColor)
  const [showAddDevice, setShowAddDevice] = useState(false)
  const [initialModalMode, setInitialModalMode] =useState<'create' | 'join' | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [syncLogs, setSyncLogs] = useState<LogEntry[]>([])
  const [showDetails, setShowDetails] = useState<Record<string, boolean>>({})
  const premium = useUserStore((s) => s.preferences.premium === true)
  const { width } = useWindowDimensions()
  const colors = getColors(isDark, primaryColor)
  const contentWidth = Math.min(width - baseSpacing * 2, 350)
  const syncStatus = useRegistryStore((s) => s.syncStatus)
  const { deviceId } = useDeviceId(premium)
  const { workspaceId, setWorkspaceId } = useWorkspaceId(premium)
  const { inviteCode } = useWorkspaceDetails(premium, workspaceId, deviceId)
  useSyncStatusLogger(syncStatus, isLoading)
  useLifecycleLogger()
  useAuthCheck()
  useLogUpdates(premium, setSyncLogs)  

  const performSync = React.useCallback(
    async (type: 'push' | 'pull' | 'both') => {
      if (!premium) {
        useToastStore
          .getState()
          .showToast('Premium required', 'error')
        addSyncLog(
          '🔒 Sync rejected - premium required',
          'warning'
        )
        return
      }
      
      if (!workspaceId) {
        addSyncLog('❌ No workspace connected', 'error')
        useToastStore.getState().showToast('No workspace connected', 'error')
        return
      }
      
      setIsLoading(true)
      addSyncLog(`🚀 Starting ${type} sync`, 'info')
      try {
        if (type === 'pull' || type === 'both') {
          addSyncLog('📥 Pulling latest…', 'info')
          await pullLatestSnapshot()
          addSyncLog('✅ Pull success', 'success')
        }
        if (type === 'push' || type === 'both') {
          addSyncLog('🗄️ Export & encrypt', 'info')
          const all = useRegistryStore
            .getState()
            .getAllStoreStates()
            
          if (!all || typeof all !== 'object') {
            throw new Error('Failed to get store states')
          }
          
          try {
            await exportEncryptedState(all)
            addSyncLog('🔐 State encrypted', 'success')
          } catch (encErr) {
            addSyncLog('❌ Encryption failed', 'error', encErr instanceof Error ? encErr.message : String(encErr))
            throw encErr
          }
          
          addSyncLog('📤 Pushing…', 'info')
          await pushSnapshot()
          addSyncLog('✅ Push success', 'success')
        }
        addSyncLog('✨ Sync finished', 'success')
        
        // Force UI refresh
        setTimeout(() => {
          useRegistryStore.getState().setSyncStatus('idle')
        }, 300)
      } catch (e) {
        addSyncLog(
          '🔥 Sync aborted',
          'error',
          e instanceof Error ? e.message : String(e)
        )
      } finally {
        setIsLoading(false)
      }
    },
    [premium, workspaceId]
  )

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

  const handleSyncButtonPress = React.useCallback(() => {
    performSync('both')
  }, [performSync])

  const handleExportLogs = React.useCallback(async () => {
    try {
      await exportLogs(syncLogs)
    } catch (e) {
      addSyncLog(
        'Failed to export logs',
        'error',
        e instanceof Error ? e.message : String(e)
      )
    }
  }, [syncLogs])

  const fontSizes = { xs: 10, sm: 12, md: 14, lg: 16, xl: 18 }

  const onWorkspaceUpdated = React.useCallback((id: string, action: 'created' | 'joined') => {
    setShowAddDevice(false)
    setInitialModalMode(undefined)
    setWorkspaceId(id)
    addSyncLog(`Workspace ${action}: ${id}`, 'success')
    
    // Force refresh of registry state after workspace update
    useRegistryStore.getState().setSyncStatus('idle')
    
    // Force re-render
    setTimeout(() => {
      useRegistryStore.getState().setSyncStatus('idle')
    }, 100)
  }, [setWorkspaceId])

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.bg }]}
      contentContainerStyle={{
        paddingTop: isIpad() ? 30 : insets.top,
        paddingBottom: 100,
      }}
    >
      <YStack
        gap={baseSpacing * 2}
        padding={isWeb ? '$4' : '$2'}
        px={isWeb ? '$4' : '$3'}
        paddingBottom={baseSpacing * 6}
      >
        <XStack alignItems="center" justifyContent="center" position="relative">
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialIcons name="arrow-back"  size={22} color={isDark ? '#fff' : '#000'} />
          </TouchableOpacity>
          <Text
            fontSize={isWeb ? 24 : isIpad() ? 22 : 20}
            fontWeight="700"
            color={isDark ? '#fff' : '#000'}
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
            currentSpaceId={workspaceId || ''}
            deviceId={deviceId}
            inviteCode={inviteCode}
            onCopyInviteCode={async () => {
              if (!inviteCode) return;
              await Clipboard.setStringAsync(inviteCode);
              useToastStore.getState().showToast('Invite code copied', 'success');
              addSyncLog('📋 Invite code copied', 'info');
            }}
            onCopyCurrentSpaceId={async () => {
              if (!workspaceId) return;
              await Clipboard.setStringAsync(workspaceId);
              useToastStore.getState().showToast('Current space ID copied', 'success');
              addSyncLog('📋 Current space ID copied', 'info');
            }}            
          />
        </XStack>

        {workspaceId && premium && (
          <XStack alignItems="center" justifyContent="center">
            <TouchableOpacity onPress={handleLeaveWorkspace}>
              <Text
                color={colors.error}
                fontSize={fontSizes.sm}
                fontWeight="500"
                fontFamily="$body"
              >
                Leave Workspace
              </Text>
            </TouchableOpacity>
          </XStack>
        )}

        {premium && !workspaceId && (
          <NeedsWorkspace
            isDark={isDark}
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

        {premium && (
          <XStack
            alignItems="center"
            justifyContent="center"
            marginTop={baseSpacing * 2}
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
                performSync={performSync}
                handleSyncButtonPress={handleSyncButtonPress}
                premium={premium}
                devices={[]}
                contentWidth={contentWidth}
                maxHeight={350}
              />
            </View>
          </XStack>
        )}
      </YStack>

      {showAddDevice && (
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
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  backButton: { position: 'absolute', left: 0, padding: 8, zIndex: 1 },
})
