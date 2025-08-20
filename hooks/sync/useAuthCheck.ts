// hooks/sync/useAuthCheck.ts
import { useEffect } from 'react'
import { useUserStore } from '@/store'
import { addSyncLog } from '@/components/sync/syncUtils'

export const useAuthCheck = () => {
  const username = useUserStore(state => state.preferences.username)
  const premium = useUserStore(state => state.preferences.premium)
  
  useEffect(() => {
    const trimmed = username?.trim() || ''
    if (!trimmed) {
      addSyncLog('⚠️ No username set for sync verification', 'warning')
      return
    }
  }, [username, premium])
}
