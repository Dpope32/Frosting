import React, { useState, useEffect } from 'react'
import { YStack, isWeb } from 'tamagui'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { usePortfolioStore, updatePrincipal } from '@/store/PortfolioStore'
import { useEditStockStore } from '@/store/EditStockStore'
import { HoldingsCards } from '@/components/modals/HoldingsCards'
import { StockCard } from '@/components/modals/StockCard'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

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

export function PortfolioModal({ open, onOpenChange }: PortfolioModalProps) {
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
  const openEditStockModal = useEditStockStore(s => s.openModal)
  const closePortfolioModal = () => onOpenChange(false)
  const calculateROI = () => { 
   if (!principal || principal === 0) return 0
   return ((currentTotalValue - principal) / principal) * 100
  }
  const roi = calculateROI()
  
  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio"
      snapPoints={isWeb ? [92] : [90]}
      showCloseButton={true}
      hideHandle={true}
    >
      <YStack
        gap={isWeb ? '$2' : '$1'}
        pb={isWeb ? '$5' : '$3'}
        pt={isWeb ? '$3' : '$1'}
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
          closePortfolioModal={closePortfolioModal} 
          openEditStockModal={openEditStockModal} 
        />
      </YStack>
    </BaseCardModal>
  )
}
