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
        const pb = await getPocketBase()
        const ws = await pb
          .collection('sync_workspaces')
          .getOne(workspaceId as string)

        // append this device if it's missing
        if (!ws.device_ids.includes(deviceId)) {
          await pb.collection('sync_workspaces').update(workspaceId as string, {
            device_ids: [...ws.device_ids, deviceId],
          })
          addSyncLog('✅ Appended device to workspace', 'info')
        }

        setInviteCode(ws.invite_code || null)
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
