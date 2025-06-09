// app/modals/portfolio.tsx
import React, { useCallback,  useEffect, useState } from 'react'
import { StyleSheet, ScrollView } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { YStack, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { useColorScheme } from '@/hooks'
import { useUserStore } from '@/store'
import { isIpad } from '@/utils'
import { getColors, baseSpacing } from '@/components/sync'
import { ModalHeader } from '@/components/shared/ModalHeader'
import { usePortfolioStore, useEditStockStore, updatePrincipal } from '@/store'
import { Stock } from '@/types'
import { StockCard } from '@/components/modals/StockCard'
import { HoldingsCards } from '@/components/modals/HoldingsCards'



function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)
    return () => {
      clearTimeout(timer)
    }
  }, [value, delay])
  return debouncedValue
}

export default function PortfolioScreen() {
  const insets = useSafeAreaInsets()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const primaryColor = useUserStore((s) => s.preferences.primaryColor)
  const colors = getColors(isDark, primaryColor)
  const { totalValue, principal } = usePortfolioStore()
  const currentTotalValue = totalValue ?? 0
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false)
  const [principalInput, setPrincipalInput] = useState(principal.toString())
  const debouncedPrincipalInput = useDebounce(principalInput, 300)

  useEffect(() => {
    if (isEditingPrincipal) {
      const newValue = parseFloat(debouncedPrincipalInput)
      if (!isNaN(newValue) && newValue >= 0) {
        updatePrincipal(newValue)
      }
    }
  }, [debouncedPrincipalInput, isEditingPrincipal])

  const openEditStockModal = useCallback((stock: Stock) => {
    useEditStockStore.getState().openModal(stock, false);
  }, []);

  const openAddStockModal = useCallback(() => {
    useEditStockStore.getState().openModal(undefined, true);
  }, []);

  const calculateROI = () => { 
   if (!principal || principal === 0) return 0
   return ((currentTotalValue - principal) / principal) * 100
  }
  const roi = calculateROI()
  
  return (
    <>
    <ScrollView
      style={[styles.container, { backgroundColor: isDark ? '#020202' : '#f9f9f9' }]}
      contentContainerStyle={{ paddingTop: isIpad() ? 30 : insets.top, paddingBottom: isWeb ? 100 : isIpad() ? 50 : 25}}
    >
      <YStack gap={baseSpacing * 2} p={isWeb ? '$4' : '$2'} px={isWeb ? '$4' : '$2'} pb={baseSpacing * 6} >
        <ModalHeader title="Portfolio" isDark={isDark} />
      <YStack
        gap={isWeb ? '$2' : '$3'}
        pb={isWeb ? '$5' : '$3'}
        pt={isWeb ? '$3' : isIpad() ? '$2' : '$1'}
        px={isWeb ? '$2' : '$2'}
      >
        <StockCard
          currentTotalValue={currentTotalValue}
          principal={principal}
          isEditingPrincipal={isEditingPrincipal}
          principalInput={principalInput}
          setIsEditingPrincipal={setIsEditingPrincipal}
          setPrincipalInput={setPrincipalInput}
          roi={roi}
        />
        <HoldingsCards 
          openEditStockModal={openEditStockModal}
          openAddStockModal={openAddStockModal}
        />
      </YStack> 
      </YStack>
    </ScrollView>
      <Button
        onPress={openAddStockModal}
        position="absolute"
        bottom={40}
        right={24}
        zIndex={1000}
        size="$4"
        circular
        bg={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <MaterialIcons name="add" size={24} color="white" />
      </Button>
  </>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1 },
})
