import { useState, useEffect, useCallback } from 'react'
import { Platform } from 'react-native'
import * as FileSystem from 'expo-file-system'
import { addSyncLog } from '@/components/sync/syncUtils'

// Simple functions to read/write the workspace ID with web compatibility
async function readWorkspaceIdFromFile(): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      const id = localStorage.getItem('workspace_id')
      return id || null
    }
    
    // Use file system on native
    const filepath = `${FileSystem.documentDirectory}workspace_id.txt`
    const fileInfo = await FileSystem.getInfoAsync(filepath)
    
    if (fileInfo.exists) {
      const content = await FileSystem.readAsStringAsync(filepath)
      return content.trim() || null
    }
    return null
  } catch (err) {
    console.error('Error reading workspace ID:', err)
    return null
  }
}

async function writeWorkspaceIdToFile(id: string | null): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      // Use localStorage on web
      if (id) {
        localStorage.setItem('workspace_id', id)
      } else {
        localStorage.removeItem('workspace_id')
      }
      return
    }
    
    // Use file system on native
    const filepath = `${FileSystem.documentDirectory}workspace_id.txt`
    if (id) {
      await FileSystem.writeAsStringAsync(filepath, id)
    } else {
      // If id is null, delete the file if it exists
      const fileInfo = await FileSystem.getInfoAsync(filepath)
      if (fileInfo.exists) {
        await FileSystem.deleteAsync(filepath)
      }
    }
  } catch (err) {
    console.error('Error writing workspace ID:', err)
  }
}

export function useWorkspaceId(isPremium: boolean) {
  const [workspaceId, setWorkspaceIdState] = useState<string | null>(null)
  
  // Immediately read the workspace ID on component mount
  useEffect(() => {
    const loadWorkspaceId = async () => {
      if (!isPremium) return
      try {
        const id = await readWorkspaceIdFromFile()
        if (id) {
          setWorkspaceIdState(id)
        }
      } catch (err) {
        console.error('Failed to read workspace ID for UI:', err)
      }
    }
    
    loadWorkspaceId()
  }, [isPremium])
  
  const setWorkspaceId = useCallback(async (id: string | null) => {
    setWorkspaceIdState(id)
    await writeWorkspaceIdToFile(id)
    
    if (id) {
      addSyncLog(`📝 Workspace ID set: ${id}`, 'info')
    } else {
      addSyncLog('🗑️ Workspace ID cleared', 'info')
    }
  }, [])
  
  return { workspaceId, setWorkspaceId }
}
