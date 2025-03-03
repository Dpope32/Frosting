import React, { useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, Spinner, Stack } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { useNetworkStore } from '@/store/NetworkStore'
import { getWifiDetails } from '@/services/wifiServices'

const getStrengthColor = (strength: string | number | undefined | null, isDark: boolean): string => {
  if (strength === null || strength === undefined || strength === '...' || strength === 'Offline') {
    return isDark ? '#a1a1aa' : '#18181b' // zinc-400 : zinc-900
  }
  
  // Handle "X ms" format
  if (typeof strength === 'string' && strength.includes('ms')) {
    const value = parseInt(strength);
    if (isNaN(value)) return isDark ? '#a1a1aa' : '#18181b';
    
    // Color based on ping values
    if (isDark) {
      if (value <= 50) return '#15803d'    // green-700
      if (value <= 100) return '#22c55e'   // green-500
      if (value <= 200) return '#eab308'   // yellow-500
      if (value <= 300) return '#f97316'   // orange-500
      return '#ef4444'                      // red-500
    } else {
      if (value <= 50) return '#15803d'    // green-700
      if (value <= 100) return '#16a34a'   // green-600
      if (value <= 200) return '#ca8a04'   // yellow-600
      if (value <= 300) return '#ea580c'   // orange-600
      return '#dc2626'                      // red-600
    }
  }
  
  // Handle "X Mbps" format
  if (typeof strength === 'string' && strength.includes('Mbps')) {
    const value = parseInt(strength);
    if (isNaN(value)) return isDark ? '#a1a1aa' : '#18181b';
    
    // Color based on Mbps values
    if (isDark) {
      if (value >= 1000) return '#15803d'  // green-700
      if (value >= 300) return '#22c55e'   // green-500
      if (value >= 100) return '#eab308'   // yellow-500
      return '#f97316'                      // orange-500
    } else {
      if (value >= 1000) return '#15803d'  // green-700
      if (value >= 300) return '#16a34a'   // green-600
      if (value >= 100) return '#ca8a04'   // yellow-600
      return '#ea580c'                      // orange-600
    }
  }
  
  // Handle percentage values (for signal strength)
  const value = typeof strength === 'string' ? parseInt(strength.replace('%', '')) : strength
  
  if (isDark) {
    if (value <= 20) return '#ef4444'  // red-500
    if (value <= 40) return '#f97316'  // orange-500
    if (value <= 60) return '#eab308'  // yellow-500
    if (value <= 80) return '#22c55e'  // green-500
    return '#15803d'                    // green-700
  } else {
    if (value <= 20) return '#dc2626'  // red-600
    if (value <= 40) return '#ea580c'  // orange-600
    if (value <= 60) return '#ca8a04'  // yellow-600
    if (value <= 80) return '#16a34a'  // green-600
    return '#15803d'                    // green-700
  }
}

interface WifiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  speed?: string
}

export function WifiModal({ open, onOpenChange, speed }: WifiModalProps) {
  const { details, isLoading, error, fetchNetworkInfo, startNetworkListener } = useNetworkStore()

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    
    if (open) {
      fetchNetworkInfo();
      // Only start a new listener if we don't have one
      if (!unsubscribe) {
        unsubscribe = startNetworkListener();
      }
    }
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [open]);

  const wifiDetails = getWifiDetails(details)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Network Details"
    >
      <YStack gap="$4" opacity={isLoading ? 0.5 : 1}>
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">Current Speed</Text>
          {isLoading ? (
            <YStack alignItems="center" marginTop="$2">
              <Spinner size="small" color="$gray10" />
              <Text color={isDark ? "#a0a0a0" : "#666666"} fontSize={14} marginTop="$2">
                Checking speed...
              </Text>
            </YStack>
          ) : (
            <Text 
              color={getStrengthColor(speed, isDark)} 
              fontSize={32} 
              fontWeight="600"
              marginTop="$2"
            >
              {speed || 'N/A'}
            </Text>
          )}
        </YStack>
        <YStack
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">Network Details</Text>
          {isLoading ? ( 
            <Spinner size="small" color="$gray10" />
          ) : error ? (
            <Text color="#ff6b6b" fontSize={14} marginTop="$2"> {error}</Text>
          ) : details?.type === 'wifi' && wifiDetails ? (
            <YStack gap="$2" marginTop="$2">
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}> SSID: {wifiDetails.ssid || 'Unknown'} </Text>
              <Text fontFamily="$body" color={getStrengthColor(wifiDetails.strength, isDark)} fontSize={14} fontWeight="500"> Strength: {wifiDetails.strength || 'Unknown'}</Text>
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}> Frequency: {wifiDetails.frequency || 'Unknown'} MHz</Text>
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}> IP Address: {details.details?.ipAddress || 'Unknown'}</Text>
              <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}> Subnet: {details.details?.subnet || 'Unknown'}</Text>
              {details.isInternetReachable !== null && (
                <Text 
                  color={details.isInternetReachable ? 
                    (isDark ? "#22c55e" : "#16a34a") : 
                    (isDark ? "#ef4444" : "#dc2626")
                  } 
                  fontSize={14}
                  fontWeight="500"
                >
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
          backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
          borderRadius={12}
          padding="$4"
          borderWidth={1}
          borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
        >
          <Text color={isDark ? "#fff" : "#000"} fontSize={16} fontWeight="500">Connection Status</Text>
          <YStack gap="$2" marginTop="$2">
            <Text color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Type: {details?.type || 'Unknown'}
            </Text>
            <Text 
              color={details?.isConnected ? 
                (isDark ? "#22c55e" : "#16a34a") : 
                (isDark ? "#ef4444" : "#dc2626")
              }
              fontSize={14}
              fontWeight="500"
            >
              Status: {isLoading ? 'Checking...' : details?.isConnected ? 'Connected' : 'Disconnected'}
            </Text>
            <Text color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
              Data Usage: {details?.details?.isConnectionExpensive ? 'Metered' : 'Unmetered'}
            </Text>
          </YStack>
        </YStack>
      </YStack>
    </BaseCardModal>
  )
}
