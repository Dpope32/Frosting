// hooks/sync/useWorkspaceId.ts
import { useEffect, useState } from 'react'
import { getCurrentWorkspaceId as getWsIdUtil } from '@/sync/workspace'
import { addSyncLog } from '@/components/sync/syncUtils'

export function useWorkspaceId(premium: boolean) {
  const [workspaceId, setWorkspaceId] = useState<string | null>(null)

  useEffect(() => {
    if (!premium) {
      setWorkspaceId(null)
      return
    }

    async function loadWorkspace() {
      try {
        const id = await getWsIdUtil()  // await the Promise
        setWorkspaceId(id)
        addSyncLog(`Workspace ID loaded: ${id}`, 'info')
      } catch (e) {
        addSyncLog(`Failed to load workspace ID`, 'error', (e as Error).message)
      }
    }

    loadWorkspace()
  }, [premium])

  return { workspaceId }
}
