// hooks/sync/useLogUpdates.ts
import { useEffect } from 'react'
import { setLogUpdateCallback } from '@/components/sync/syncUtils'
import { LogEntry } from '@/components/sync/syncUtils'

export function useLogUpdates(
  premium: boolean,
  setSyncLogs: (logs: LogEntry[]) => void
) {
  useEffect(() => {
    setLogUpdateCallback(premium ? setSyncLogs : null)
    return () => setLogUpdateCallback(null)
  }, [premium, setSyncLogs])
}
