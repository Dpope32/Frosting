import React, { useEffect, useState } from 'react'
import { useColorScheme, Platform } from 'react-native'
import { YStack, Text, Spinner, XStack, isWeb } from 'tamagui'
import Animated, { SlideInDown } from 'react-native-reanimated'
import { BaseCardAnimated } from './BaseCardAnimated'
import { useNetworkStore } from '@/store/NetworkStore'
import { getWifiDetails } from '@/services/wifiServices'
import { useNetworkSpeed } from '@/hooks/useNetworkSpeed'
import { useDeviceInfo } from '@/hooks/useDeviceInfo'
import { useCellular } from '@/hooks/useCellular'
import { getStrengthColor } from '@/utils/styleUtils'
import { isIpad } from '@/utils/deviceUtils'

interface WifiModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function WifiModal({ open, onOpenChange }: WifiModalProps): JSX.Element | null { 
  if (!open) {
    return null;
  }

  const { details, error, fetchNetworkInfo, startNetworkListener } = useNetworkStore()
  const { speed, isLoading } = useNetworkSpeed()
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false)
  const colorScheme = useColorScheme()
  const isDark: boolean = colorScheme === 'dark'
  let unsubscribe: (() => void) | undefined
  const deviceInfo = useDeviceInfo()
  const cellularInfo = useCellular()

  useEffect(() => {
    const refreshNetworkInfo = async () => {
      if (open) {
        setIsRefreshing(true)
        await fetchNetworkInfo()
        setIsRefreshing(false)
        if (!unsubscribe) {
          unsubscribe = startNetworkListener()
        }
      }
    }
    refreshNetworkInfo()
    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [open, fetchNetworkInfo, startNetworkListener])

  const wifiDetails = getWifiDetails(details)
  const showLoading: boolean = isLoading || isRefreshing
  
  const shouldDisplayField = (value: any): boolean => {
    return value !== undefined && value !== null && value !== 'Unknown';
  }

  const getCellularGenerationText = (generation: any): string => {
    if (!generation) return 'Unknown';
    return generation.replace('CELLULAR_', '');
  }

  return (
    <BaseCardAnimated 
      onClose={() => onOpenChange(false)} 
      title="Network Details"
    > 
      <YStack gap="$4" opacity={showLoading ? 0.7 : 1}>
        <Animated.View entering={SlideInDown.duration(500).delay(0)}>
          <YStack
            backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
            br={12}
            padding="$4"
            borderWidth={1}
            borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
          >
            <YStack gap="$2" mt="$2">
              {shouldDisplayField(deviceInfo.deviceName) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Device:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#555555"} fontSize={14}>
                    {deviceInfo.deviceType}
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.modelName) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Model:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.modelName}
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.productName) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Product:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.productName}
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.designName) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Design:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.designName}
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.deviceYearClass) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Year:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.deviceYearClass}
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.totalMemory) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Memory:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.totalMemory ? Math.round(deviceInfo.totalMemory / (1024 * 1024 * 1024)) : 0} GB
                  </Text>
                </XStack>
              )}
              {shouldDisplayField(deviceInfo.osName) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    OS: 
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {deviceInfo.osName} {deviceInfo.osVersion}
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>
        </Animated.View>

        <Animated.View entering={SlideInDown.duration(500).delay(150)}>
          <YStack
            backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
            br={12}
            padding="$4"
            borderWidth={1}
            borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
          >
            {showLoading ? (
              <YStack alignItems="center" mt="$2">
                <Spinner size="small" color="$gray10" />
              </YStack>
            ) : error ? (
              <Text fontFamily="$body" color="#ff6b6b" fontSize={14} mt="$2">
                {error}
              </Text>
            ) : details?.type === 'wifi' && wifiDetails ? (
              <YStack gap="$2" >
                {shouldDisplayField(wifiDetails.strength) && (
                  <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={getStrengthColor(wifiDetails.strength, isDark)}fontSize={14} fontWeight="500"  >
                    Strength: 
                  </Text>
                  <Text fontFamily="$body" color={getStrengthColor(wifiDetails.strength, isDark)} fontSize={14} fontWeight="500">
                    {wifiDetails.strength}
                  </Text>
                  </XStack>
                )}
                {shouldDisplayField(wifiDetails.frequency) && (
                  <XStack alignItems="center" gap="$2">
                    <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                      Frequency:
                    </Text>
                    <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                      {wifiDetails.frequency} MHz
                    </Text>
                  </XStack>
                )}
                {shouldDisplayField(wifiDetails.strength) && (
                  <XStack alignItems="center" gap="$2">
                    <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                      Signal Quality:
                    </Text>
                    <Text fontFamily="$body" color={getStrengthColor(wifiDetails.strength, isDark)} fontSize={14}>
                      {wifiDetails.strength}
                    </Text>
                  </XStack>
                )}
                {shouldDisplayField(details.details?.ipAddress) && (
                  <XStack alignItems="center" gap="$2">
                    <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                      IP Address: 
                    </Text>
                    <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                      {details.details?.ipAddress}
                    </Text>
                  </XStack>
                )}
                {shouldDisplayField(details.details?.subnet) && (
                  <XStack alignItems="center" gap="$2">
                    <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                      Subnet: 
                    </Text>
                    <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                      {details.details?.subnet}
                    </Text>
                  </XStack>
                )}
                <XStack alignItems="center" gap="$2" >
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Speed:
                  </Text>
                  <Text
                    fontFamily="$body"
                    color={getStrengthColor(speed, isDark)}
                    fontSize={Platform.OS === 'web' ? 20 : 16}
                    fontWeight="600"
                  >
                    {speed || (__DEV__ ? '89 ms' : (Platform.OS === 'web' ? '80 ms' : '75 ms'))}
                  </Text>
                </XStack>
                {details.isInternetReachable !== null && (
                  <Text
                    fontFamily="$body"
                    color={details.isInternetReachable ? (isDark ? "#22c55e" : "#16a34a") : (isDark ? "#ef4444" : "#dc2626")}
                    fontSize={14}
                    fontWeight="500"
                  >
                    Internet: {details.isInternetReachable ? 'Connected' : 'Not Connected'}
                  </Text>
                )}
              </YStack>
            ) : (
              <YStack gap="$2" mt="$2">
                {!cellularInfo.isLoading && (
                  <>
                    {shouldDisplayField(cellularInfo.carrier) && (
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                          Carrier: 
                        </Text>
                        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                          {cellularInfo.carrier}
                        </Text>
                      </XStack>
                    )}
                    {shouldDisplayField(cellularInfo.cellularGeneration) && (
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                          Network: 
                        </Text>
                        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                          {getCellularGenerationText(cellularInfo.cellularGeneration)}
                        </Text>
                      </XStack>
                    )}
                    {shouldDisplayField(cellularInfo.countryCode) && (
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                          Country: 
                        </Text>
                        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                          {cellularInfo.countryCode}
                        </Text>
                      </XStack>
                    )}
                    {shouldDisplayField(cellularInfo.mobileCountryCode) && (
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                          MCC: 
                        </Text>
                        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                          {cellularInfo.mobileCountryCode}
                        </Text>
                      </XStack>
                    )}
                    {shouldDisplayField(cellularInfo.mobileNetworkCode) && (
                      <XStack alignItems="center" gap="$2">
                        <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                          MNC: 
                        </Text>
                        <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                          {cellularInfo.mobileNetworkCode}
                        </Text>
                      </XStack>
                    )}
                  </>
                )}
                <XStack alignItems="center" gap="$2" mt="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Speed:
                  </Text>
                  <Text
                    fontFamily="$body"
                    color={getStrengthColor(speed, isDark)}
                    fontSize={Platform.OS === 'web' ? 20 : 16}
                    fontWeight="600"
                  >
                    {speed || (__DEV__ ? '89 ms' : (Platform.OS === 'web' ? '80 ms' : '75 ms'))}
                  </Text>
                </XStack>
                <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#666666"} fontSize={14}>
                  {details?.isConnected ? 'Not connected to WiFi' : 'No network connection'}
                </Text>
              </YStack>
            )}
          </YStack>
        </Animated.View>

        <Animated.View entering={SlideInDown.duration(500).delay(300)}>
          <YStack
            backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
            br={12}
            padding="$4"
            borderWidth={1}
            borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0,0,0,0.1)"}
          >
            <YStack gap="$2">
              <XStack alignItems="center" gap="$2">
                <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                  Status:
                </Text>
                <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                  {showLoading ? 'Checking...' : details?.isConnected ? 'Connected' : 'Disconnected'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                  Internet:
                </Text>
                <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                  {details?.isInternetReachable ? 'Reachable' : 'Unreachable'}
                </Text>
              </XStack>
              {shouldDisplayField(details?.details?.isConnectionExpensive !== undefined) && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Data Usage:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    {details?.details?.isConnectionExpensive ? 'Metered' : 'Unmetered'}
                  </Text>
                </XStack>
              )}
              <XStack alignItems="center" gap="$2">
                <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                  Connection Type:
                </Text>
                <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                  {details?.type || 'Unknown'}
                </Text>
              </XStack>
              <XStack alignItems="center" gap="$2">
                <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                  Last Updated:
                </Text>
                <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                  {new Date().toLocaleTimeString()}
                </Text>
              </XStack>
              {Platform.OS === 'web' && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Platform:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    Web
                  </Text>
                </XStack>
              )}
              {__DEV__ && (
                <XStack alignItems="center" gap="$2">
                  <Text fontFamily="$body" color={isDark ? "#f3f3f3" : "#333"} fontSize={14}>
                    Environment:
                  </Text>
                  <Text fontFamily="$body" color={isDark ? "#a0a0a0" : "#333"} fontSize={14}>
                    Development
                  </Text>
                </XStack>
              )}
            </YStack>
          </YStack>
        </Animated.View>
      </YStack>
    </BaseCardAnimated>
  )
}
