import React from 'react'
import { useColorScheme, StyleSheet } from 'react-native'
import { YStack } from 'tamagui'
import Animated, { FadeIn } from 'react-native-reanimated'
import { StockMetrics } from './StockMetrics'
import { getStockValueColor } from '@/utils'
import { LinearGradient } from 'expo-linear-gradient'

interface StockCardProps {
  currentTotalValue: number
  principal: number
  isEditingPrincipal: boolean
  principalInput: string
  setIsEditingPrincipal: (value: boolean) => void
  setPrincipalInput: (value: string) => void
  roi: number
}

export function StockCard({
  currentTotalValue,
  principal,
  isEditingPrincipal,
  principalInput,
  setIsEditingPrincipal,
  setPrincipalInput,
  roi,
}: StockCardProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const styles = StyleSheet.create({
    card: {
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? '#222' : 'rgba(0, 0, 0, 0.1)',
      padding: 16,
      width: '100%',
      overflow: 'hidden',
      position: 'relative',
    },
    gradient: {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
    }
  })

  return (
    <YStack width="100%">
      <Animated.View entering={FadeIn.duration(600)} style={styles.card}>
        <LinearGradient
          colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
        <StockMetrics
          currentTotalValue={currentTotalValue}
          principal={principal}
          isEditingPrincipal={isEditingPrincipal}
          principalInput={principalInput}
          setIsEditingPrincipal={setIsEditingPrincipal}
          setPrincipalInput={setPrincipalInput}
          roi={roi}
          getStockValueColor={(value: number) => getStockValueColor(value, isDark)}
          isDark={isDark}
        />
      </Animated.View>
    </YStack>
  )
} 