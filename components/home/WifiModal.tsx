import React, { useEffect, useState } from 'react'
import { useColorScheme } from 'react-native'
import { YStack } from 'tamagui'

import { useNetworkStore } from '@/store'
import { useNetworkSpeed } from '@/hooks'
import { BaseCardAnimated } from '../baseModals/BaseCardAnimated'
import { CurrentSpeed } from './CurrentSpeed'
import { NetworkDetails } from './NetworkDetails'
import { Status } from './Status'

interface WifiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WifiModal({ open, onOpenChange }: WifiModalProps): JSX.Element | null { 
  if (!open) { return null }

  const { details, fetchNetworkInfo, startNetworkListener } = useNetworkStore()
  const { speed, isLoading } = useNetworkSpeed()
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const colorScheme = useColorScheme()
  const isDark: boolean = colorScheme === 'dark'
  let unsubscribe: (() => void) | undefined

  useEffect(() => {
    const refreshNetworkInfo = async () => {
      if (open) {
        setIsRefreshing(true)
        await fetchNetworkInfo()
        setIsRefreshing(false)
        if (!unsubscribe) {unsubscribe = startNetworkListener()}
      }
    }
    refreshNetworkInfo()
    return () => {
      if (unsubscribe) {unsubscribe()}
    }
  }, [open, fetchNetworkInfo, startNetworkListener])

  const showLoading: boolean = isLoading || isRefreshing

  const getStatusString = (): string => {
    if (!details) return 'Unknown'
    if (showLoading) return 'Checking'
    const status = details.isConnected ? 'Connected' : 'Disconnected'
    const type = details.type || 'Unknown'
    const isExpensive = details.details?.isConnectionExpensive ? 'Metered' : 'Unmetered'
    return `${status} ${type} ${isExpensive}`
  }

  return (
    <BaseCardAnimated onClose={() => onOpenChange(false)} title="Network Details"> 
      <YStack gap="$4" opacity={showLoading ? 0.7 : 1}>
        <CurrentSpeed isDark={isDark} showLoading={showLoading} />
        <NetworkDetails isDark={isDark} showLoading={showLoading} />
        <Status isDark={isDark} showLoading={showLoading} status={getStatusString()}/>
      </YStack>
    </BaseCardAnimated>
  )
}
