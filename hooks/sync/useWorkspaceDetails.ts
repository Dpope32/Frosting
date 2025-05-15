// hooks/sync/useWorkspaceDetails.ts
import { useEffect, useState } from 'react'
import { addSyncLog } from '@/components/sync/syncUtils'
import { getPocketBase } from '@/sync/pocketSync'

export function useWorkspaceDetails(
  premium: boolean,
  workspaceId: string | null,
  deviceId: string
) {
  const [inviteCode, setInviteCode] = useState<string | null>(null)

  useEffect(() => {
    if (!premium || !workspaceId) {
      setInviteCode(null)
      return
    }

    async function fetchDetails() {
      try {
        addSyncLog('🔍 Fetching workspace details', 'verbose')
        const pb = await getPocketBase()
        const ws = await pb
          .collection('sync_workspaces')
          .getOne(workspaceId)

        // append this device if it’s missing
        if (!ws.device_ids.includes(deviceId)) {
          await pb.collection('sync_workspaces').update(workspaceId, {
            device_ids: [...ws.device_ids, deviceId],
          })
          addSyncLog('✅ Appended device to workspace', 'info')
        }

        setInviteCode(ws.invite_code || null)
        addSyncLog('✅ Workspace invite code retrieved', 'success')
      } catch (e) {
        addSyncLog(
          '❌ Failed to fetch workspace details',
          'error',
          (e as Error).message
        )
        setInviteCode(null)
      }
    }

    fetchDetails()
  }, [premium, workspaceId, deviceId])

  return { inviteCode }
}
