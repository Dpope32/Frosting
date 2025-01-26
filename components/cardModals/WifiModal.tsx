import React, { useEffect } from 'react'
import { YStack, Text, Spinner } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { useNetworkStore } from '@/store/NetworkStore'
import { getWifiDetails } from '@/services/wifiServices'

interface WifiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  speed?: string
}

export function WifiModal({ open, onOpenChange, speed }: WifiModalProps) {
  const { details, isLoading, error, fetchNetworkInfo, startNetworkListener } = useNetworkStore()

  useEffect(() => {
    if (open) {
      fetchNetworkInfo()
      const unsubscribe = startNetworkListener()
      return () => unsubscribe()
    }
  }, [open, fetchNetworkInfo, startNetworkListener])

  const wifiDetails = getWifiDetails(details)

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Network Details"
    >
      <YStack gap="$4" opacity={isLoading ? 0.5 : 1}>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Current Speed</Text>
          <Text color="#a0a0a0" fontSize={32} marginTop="$2">
            {speed || 'N/A'}
          </Text>
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Network Details</Text>
          {isLoading ? (
            <Spinner size="small" color="$gray10" />
          ) : error ? (
            <Text color="#ff6b6b" fontSize={14} marginTop="$2">
              {error}
            </Text>
          ) : details?.type === 'wifi' && wifiDetails ? (
            <YStack gap="$2" marginTop="$2">
              <Text color="#a0a0a0" fontSize={14}>
                SSID: {wifiDetails.ssid || 'Unknown'}
              </Text>
              <Text color="#a0a0a0" fontSize={14}>
                Strength: {wifiDetails.strength || 'Unknown'}
              </Text>
              <Text color="#a0a0a0" fontSize={14}>
                Frequency: {wifiDetails.frequency || 'Unknown'} MHz
              </Text>
              <Text color="#a0a0a0" fontSize={14}>
                IP Address: {details.details?.ipAddress || 'Unknown'}
              </Text>
              <Text color="#a0a0a0" fontSize={14}>
                Subnet: {details.details?.subnet || 'Unknown'}
              </Text>
              {details.isInternetReachable !== null && (
                <Text color="#a0a0a0" fontSize={14}>
                  Internet: {details.isInternetReachable ? 'Connected' : 'Not Connected'}
                </Text>
              )}
            </YStack>
          ) : (
            <Text color="#a0a0a0" fontSize={14} marginTop="$2">
              Not connected to WiFi
            </Text>
          )}
        </YStack>
        <YStack
          backgroundColor="rgba(45,45,45,0.8)"
          borderRadius={12}
          padding="$4"
          borderColor="rgba(85,85,85,0.5)"
          borderWidth={1}
        >
          <Text color="#fff" fontSize={16} fontWeight="500">Connection Status</Text>
          <YStack gap="$2" marginTop="$2">
            <Text color="#a0a0a0" fontSize={14}>
              Type: {details?.type || 'Unknown'}
            </Text>
            <Text color="#a0a0a0" fontSize={14}>
              Status: {isLoading ? 'Checking...' : details?.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
            <Text color="#a0a0a0" fontSize={14}>
              Data Usage: {details?.details?.isConnectionExpensive ? 'Metered' : 'Unmetered'}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
