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
    
    const isPremium = premium === true
    const status = isPremium ? 'premium user' : 'non-premium user'
    
    addSyncLog(`🔐 Auth check: ${trimmed} verified as ${status}`, isPremium ? 'success' : 'info')
  }, [username, premium])
}
