// hooks/sync/useDeviceId.ts
import { useEffect, useState } from 'react'
import { generateSyncKey } from '@/sync/registrySyncManager'
import { addSyncLog } from '@/components/sync/syncUtils'

export function useDeviceId(premium: boolean) {
  const [deviceId, setDeviceId] = useState<string>('')

  useEffect(() => {
    if (!premium) {
      setDeviceId('')
      return
    }

    async function loadDevice() {
      try {
        const id = await generateSyncKey()  
        setDeviceId(id)
        addSyncLog(`Device ID generated: ${id.substring(0, 8)}...`, 'info')
      } catch (e) {
        addSyncLog('Failed to generate device ID', 'error', (e as Error).message)
      }
    }

    loadDevice()
  }, [premium])

  return { deviceId }
}
