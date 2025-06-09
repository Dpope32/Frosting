import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { YStack, Text, Button, XStack, useTheme, Input, isWeb } from 'tamagui'
import { useColorScheme, TextInput, Alert } from 'react-native'
import { StockCardAnimated } from '../../baseModals/StockCardAnimated'
import { useUserStore, useToastStore, useEditStockStore } from '@/store'
import { Stock } from '@/types'
import { portfolioData, updatePortfolioData, isIpad } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'
import { initializeStocksData } from '@/services'
import { MaterialIcons } from '@expo/vector-icons'
import { useAutoFocus } from '@/hooks'
import { 
  StockQuantityInput, 
  ErrorMessage, 
  StockDisplay, 
  ActionButton, 
  useStockStyles,
  renderStockIcon
} from '@/components/stocks'

export function EditStockModal() {
  const isOpen = useEditStockStore(s => s.isOpen && s.isAddMode !== true)
  const selectedStock = useEditStockStore(s => s.selectedStock)
  const closeModal = useEditStockStore(s => s.closeModal)
  
  return (
    <EditStockModalContent
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}
      stock={selectedStock}
    />
  )
}

interface EditStockModalContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock?: Stock
}

export function EditStockModalContent({ open, onOpenChange, stock }: EditStockModalContentProps) {
  const [formData, setFormData] = useState({ ticker: '', quantity: '', name: '' })
  const [error, setError] = useState('')
  const [stocksInitialized, setStocksInitialized] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isQuantityFocused, setIsQuantityFocused] = useState(false)
  const [isQuantityEditMode, setIsQuantityEditMode] = useState(true)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const showToast = useToastStore((state) => state.showToast)
  const quantityInputRef = useRef<TextInput>(null)
  const queryClient = useQueryClient()
  useAutoFocus(quantityInputRef, 500, open)

  useEffect(() => {
    const initStocks = async () => {
      try {
        if (!stocksInitialized) {
          await initializeStocksData()
          setStocksInitialized(true)
        }
      } catch (error) {
        console.error('Failed to initialize stocks data:', error)
      }
    }

    if (open) {
      initStocks()
      setIsQuantityEditMode(true)
    }
  }, [open, stocksInitialized])

  useEffect(() => {
    if (stock && open) {
      setFormData({
        ticker: stock.symbol,
        quantity: stock.quantity.toString(),
        name: stock.name
      })
    } else {
      setFormData({ ticker: '', quantity: '', name: '' })
    }
    setError('')
    setLoading(false)
  }, [stock, open])

  const handleQuantityChange = useCallback((value: string) => {
    const numericValue = value.replace(/[^0-9]/g, '')
    setFormData(prev => ({ ...prev, quantity: numericValue }))
    setError('')
  }, [])

  const handleQuantityFocus = useCallback(() => {
    setIsQuantityFocused(true)
    setIsQuantityEditMode(true)
  }, [])

  const handleQuantityBlur = useCallback(() => {
    setIsQuantityFocused(false)
    if (formData.quantity) {
      setIsQuantityEditMode(false)
    }
  }, [formData.quantity])

  const handleSave = useCallback(async () => {
    if (loading) return
    
    try {
      setLoading(true)
      
      if (!formData.ticker || !formData.quantity || !formData.name) {
        setError('All fields are required')
        return
      }

      const quantityNum = Number(formData.quantity)
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError('Please enter a valid quantity greater than 0')
        return
      }

      if (!stock) {
        setError('No stock selected for editing')
        return
      }

      const updatedStock: Stock = {
        symbol: formData.ticker.toUpperCase(),
        quantity: quantityNum,
        name: formData.name
      }

      const updatedPortfolio = portfolioData.map(s => 
        s.symbol === stock.symbol ? updatedStock : s
      )

      updatePortfolioData(updatedPortfolio)
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
      
      setError('')
      onOpenChange(false)
      showToast(`Successfully updated ${updatedStock.symbol} holdings!`, 'success')
    } catch (err) {
      console.error('Error updating stock:', err)
      setError('Failed to update portfolio. Please try again.')
    } finally {
      setLoading(false)
    }
  }, [formData, stock, onOpenChange, queryClient, showToast, loading])

  const handleDelete = useCallback(() => {
    if (!stock || loading) return

    const deleteStock = () => {
      setLoading(true)
      try {
        const updatedPortfolio = portfolioData.filter(s => s.symbol !== stock.symbol)
        updatePortfolioData(updatedPortfolio)
        queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
        onOpenChange(false)
        showToast(`${stock.symbol} removed from portfolio`, 'success')
      } catch (err) {
        console.error('Error deleting stock:', err)
        showToast('Failed to remove stock. Please try again.', 'error')
      } finally {
        setLoading(false)
      }
    }

    if (isWeb) {
      if (window.confirm(`Are you sure you want to remove ${stock.symbol} from your portfolio?`)) {
        deleteStock()
      }
    } else {
      Alert.alert(
        'Remove Stock',
        `Are you sure you want to remove ${stock.symbol} from your portfolio?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { 
            text: 'Remove', 
            style: 'destructive', 
            onPress: deleteStock
          }
        ]
      )
    }
  }, [stock, onOpenChange, queryClient, showToast, loading])

  const handleClose = useCallback(() => {
    if (!loading) {
      onOpenChange(false)
    }
  }, [onOpenChange, loading])

  const modalTitle = stock ? `Edit ${stock.symbol} Holdings` : 'Edit Stock'
  const isFormValid = formData.ticker && formData.quantity && formData.name && !loading
  const hasChanges = stock && (
    stock.quantity.toString() !== formData.quantity ||
    stock.symbol !== formData.ticker ||
    stock.name !== formData.name
  )

  if (!stock && open) {
    return (
      <StockCardAnimated
        open={open}
        onClose={handleClose}
        title="Edit Stock"
        showCloseButton={true}
      >
        <YStack padding="$4" alignItems="center" justifyContent="center" minHeight={200}>
          <MaterialIcons 
            name="error-outline" 
            size={48} 
            color={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.6)"} 
          />
          <Text 
            fontSize={16} 
            fontFamily="$body" 
            color={isDark ? "$color11" : "$color10"}
            textAlign="center"
            mt="$3"
          >
            No stock selected for editing
          </Text>
        </YStack>
      </StockCardAnimated>
    )
  }

  return (
    <StockCardAnimated
      open={open}
      onClose={handleClose}
      title={modalTitle}
      showCloseButton={true}
    >
      <YStack padding="$2" gap="$3">
        <StockDisplay
          symbol={formData.ticker}
          name={formData.name}
          primaryColor={primaryColor}
          showQuantity={true}
          quantity={stock?.quantity}
        />
        
        <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color={isDark ? "$color11" : "$color10"} fontFamily="$body">
            Number of Shares
          </Text>
          <StockQuantityInput
            value={formData.quantity}
            onChange={handleQuantityChange}
            onFocus={handleQuantityFocus}
            onBlur={handleQuantityBlur}
            isEditMode={isQuantityEditMode}
            setIsEditMode={setIsQuantityEditMode}
            inputRef={quantityInputRef}
            primaryColor={primaryColor}
            isDark={isDark}
          />
          
          {hasChanges && (
            <XStack alignItems="center" gap="$2" mt="$1">
              <MaterialIcons 
                name="info" 
                size={16} 
                color={isDark ? "$color11" : "$color10"} 
              />
              <Text 
                fontSize={12} 
                fontFamily="$body" 
                color={isDark ? '$color11' : '$color10'}
              >
                Changes from {stock?.quantity} to {formData.quantity} shares
              </Text>
            </XStack>
          )}
        </YStack>
        
        <ErrorMessage 
          message={error} 
          visible={!!error} 
        />
        
        <XStack gap="$3" mt="$2">
          <Button
            onPress={handleDelete}
            backgroundColor={isDark ? 'rgba(239, 68, 68, 0.15)' : 'rgba(239, 68, 68, 0.1)'}
            borderColor="$red8"
            borderWidth={1}
            br={12}
            height={48}
            width={64}
            pressStyle={{ opacity: 0.7, scale: 0.95 }}
            disabled={loading || !stock}
            opacity={loading ? 0.5 : 1}
          >
            {loading ? (
              <MaterialIcons name="hourglass-empty" size={20} color="$red10" />
            ) : (
              <MaterialIcons name="delete-outline" size={20} color="rgba(233, 25, 25, 0.73)" />
            )}
          </Button>
          
          <ActionButton
            onPress={handleSave}
            label={hasChanges ? 'Update Holdings' : 'No Changes'}
            icon="save"
            isValid={Boolean(isFormValid && hasChanges)}
            isLoading={loading}
            primaryColor={primaryColor}
            isDark={isDark}
            loadingText="Updating..."
          />
        </XStack>
      </YStack>
    </StockCardAnimated>
  )
}