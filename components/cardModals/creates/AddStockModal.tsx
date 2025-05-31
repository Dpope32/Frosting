import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { debounce } from 'lodash'
import { YStack, Text, XStack, useTheme } from 'tamagui'
import { useColorScheme, TextInput } from 'react-native'
import { StockCardAnimated } from '../../baseModals/StockCardAnimated'
import { useUserStore, useToastStore, useEditStockStore } from '@/store'
import { Stock } from '@/types'
import { portfolioData, updatePortfolioData } from '@/utils'
import { useQueryClient } from '@tanstack/react-query'
import { initializeStocksData, searchStocks } from '@/services'
import { StockData } from '@/constants'
import { DebouncedInput, DebouncedInputHandle } from '@/components/shared/debouncedInput'
import { useAutoFocus } from '@/hooks'
import { 
  StockDisplay, 
  StockQuantityInput, 
  ErrorMessage, 
  StockSearchResults, 
  ActionButton,
  useStockStyles
} from '@/components/stocks'

export function AddStockModal() {
  const isOpen = useEditStockStore(s => {
    const shouldOpen = s.isOpen && s.isAddMode === true;
    return shouldOpen;
  });
  const closeModal = useEditStockStore(s => s.closeModal);

  return (
    <AddStockModalContent
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal();
      }}
    />
  );
}

interface AddStockModalContentProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddStockModalContent({ open, onOpenChange }: AddStockModalContentProps) {
  const [formData, setFormData] = useState({ ticker: '', quantity: '', name: '' })
  const [error, setError] = useState('')
  const [searchResults, setSearchResults] = useState<StockData[]>([])
  const [stocksInitialized, setStocksInitialized] = useState(false)
  const [dropdownActive, setDropdownActive] = useState(false)
  const [hasExplicitSelection, setHasExplicitSelection] = useState(false)
  const [isQuantityFocused, setIsQuantityFocused] = useState(false)
  const [isQuantityEditMode, setIsQuantityEditMode] = useState(false)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const showToast = useToastStore((state) => state.showToast)
  const tickerInputRef = useRef<DebouncedInputHandle>(null)
  const quantityInputRef = useRef<TextInput>(null)
  const queryClient = useQueryClient()
  useAutoFocus(quantityInputRef, 750, open && isQuantityEditMode)
  
  const styles = useStockStyles(primaryColor, isQuantityFocused)

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
    if (open) {
      setFormData({ ticker: '', quantity: '', name: '' })
      setHasExplicitSelection(false)
      setError('')
      setSearchResults([])
      setDropdownActive(false)
      setIsQuantityEditMode(true)
    }
  }, [open])

  const debouncedSearch = useCallback(
    debounce((query: string) => {
      if (query.trim().length > 0) {
        if (hasExplicitSelection && query.toUpperCase() === formData.ticker) {
          setSearchResults([])
          setDropdownActive(false)
          return
        }
        const results = searchStocks(query, 10, true)
        setSearchResults(results)
        setDropdownActive(results.length > 0 && !hasExplicitSelection)
      } else {
        setSearchResults([])
        setDropdownActive(false)
      }
    }, 300),
    [stocksInitialized, hasExplicitSelection, formData.ticker]
  )

  const handleTickerChange = useCallback((value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      ticker: value,
      name: hasExplicitSelection ? '' : prev.name
    }))
    if (hasExplicitSelection) setHasExplicitSelection(false)
    setError('')
    debouncedSearch(value)
  }, [debouncedSearch, hasExplicitSelection])

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

  const handleTickerFocus = useCallback(() => {
    setIsQuantityFocused(false)
    if (!hasExplicitSelection && formData.ticker.trim() && searchResults.length > 0) {
      setDropdownActive(true)
    }
  }, [formData.ticker, searchResults.length, hasExplicitSelection])

  const handleSelectStock = useCallback((selectedStockData: StockData) => {
    debouncedSearch.cancel()
    setFormData(prev => ({
      ...prev,
      ticker: selectedStockData.symbol,
      name: selectedStockData.name
    }))
    
    setHasExplicitSelection(true)
    setSearchResults([])
    setDropdownActive(false)
    
    tickerInputRef.current?.blur()
  }, [debouncedSearch])

  const handleRemoveStock = useCallback(() => {
    setFormData({ ticker: '', quantity: '', name: '' })
    setHasExplicitSelection(false)
    setDropdownActive(false)
    setTimeout(() => {
      tickerInputRef.current?.focus()
    }, 100)
  }, [])

  const handleSave = useCallback(() => {
    try {
      if (!formData.ticker || !formData.quantity || !formData.name) {
        setError('Please select a stock and enter quantity')
        return
      }

      const quantityNum = Number(formData.quantity)
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError('Please enter a valid quantity greater than 0')
        return
      }

      const existingStock = portfolioData.find(s => s.symbol === formData.ticker.toUpperCase())
      if (existingStock) {
        setError('This stock is already in your portfolio. Use edit to modify holdings.')
        return
      }

      const newStock: Stock = {
        symbol: formData.ticker.toUpperCase(),
        quantity: quantityNum,
        name: formData.name
      }

      const updatedPortfolio = [...portfolioData, newStock]
      updatePortfolioData(updatedPortfolio)
      
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] })

      setError('')
      onOpenChange(false)
      showToast(`Successfully added ${newStock.symbol} to your portfolio!`, 'success')
    } catch (err) {
      console.error('Error saving stock:', err)
      setError('Failed to add stock. Please try again.')
    }
  }, [formData, onOpenChange, queryClient, showToast])

  const isFormValid = useMemo(() => {
    return formData.ticker.trim() !== '' && 
           formData.name.trim() !== '' && 
           formData.quantity.trim() !== '' && 
           Number(formData.quantity) > 0;
  }, [formData]);

  return (
    <StockCardAnimated
      open={open}
      onClose={() => onOpenChange(false)}
      title="Add Stock"
      showCloseButton={true}
    >
      <YStack gap="$4" px="$3" pb="$2">
      <YStack gap="$2">
          <Text fontSize={14} fontWeight="600" color={isDark ? "$color11" : "$color10"} fontFamily="$body">
            Select Stock
          </Text>
          
          {hasExplicitSelection ? (
            <StockDisplay
              symbol={formData.ticker}
              name={formData.name}
              primaryColor={primaryColor}
              onRemove={handleRemoveStock}
              showRemoveButton={true}
            />
          ) : (
            <>
              <DebouncedInput
                ref={tickerInputRef} 
                value={formData.ticker}
                onDebouncedChange={handleTickerChange}
                placeholder="Search stocks by symbol or company name"
                placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.4)" : "rgba(0, 0, 0, 0.4)"}
                autoCapitalize="characters"
                fontFamily="$body"
                onFocus={handleTickerFocus}
                {...styles.input}
              />
              <StockSearchResults
                results={searchResults}
                onSelect={handleSelectStock}
                primaryColor={primaryColor}
                visible={dropdownActive}
              />
            </>
          )}
        </YStack>
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
        </YStack>
        
        <ErrorMessage 
          message={error} 
          visible={!!error} 
        />
      </YStack>
      
      <XStack px="$3" py="$3">
        <ActionButton
          onPress={handleSave}
          label="Add to Portfolio"
          isValid={isFormValid}
          primaryColor={primaryColor}
          isDark={isDark}
        />
      </XStack>
    </StockCardAnimated>
  )
}