// hooks/sync/useAuthCheck.ts
import { useEffect } from 'react'
import { Alert } from 'react-native'
import { AUTHORIZED_USERS } from '@/constants'
import { useUserStore } from '@/store'
import { addSyncLog } from '@/components/sync/syncUtils'

export function useAuthCheck() {
  const premium = useUserStore(state => state.preferences.premium)
  const username = useUserStore(state => state.preferences.username)

  useEffect(() => {
    const trimmed = username.trim()
    const isAllowed = AUTHORIZED_USERS.includes(trimmed)

    addSyncLog('Authorization check', 'info', JSON.stringify({ username, premium, isAllowed }))

    if (premium && !isAllowed) {
      addSyncLog('Revoking unauthorized premium', 'warning')
      Alert.alert(
        'Premium Removed',
        'Your account is not authorized for premium sync.',
        [{ text: 'OK', onPress: () => useUserStore.getState().setPreferences({ premium: false }) }]
      )
    }
  }, [premium, username])
}
