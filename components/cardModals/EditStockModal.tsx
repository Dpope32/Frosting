import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { YStack, Text, Input, Button } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { useUserStore } from '@/store/UserStore'
import { Stock } from '@/types'
import { portfolioData, updatePortfolioData } from '@/utils/Portfolio'
import { useQueryClient } from '@tanstack/react-query'

interface EditStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock?: Stock
}

export function EditStockModal({ open, onOpenChange, stock }: EditStockModalProps) {
  const [formData, setFormData] = useState({
    ticker: '',
    quantity: '',
    name: ''
  })
  const [error, setError] = useState('')
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)

  useEffect(() => {
    if (stock) {
      setFormData({
        ticker: stock.symbol,
        quantity: stock.quantity.toString(),
        name: stock.name
      })
    } else {
      setFormData({ ticker: '', quantity: '', name: '' })
    }
    setError('')
  }, [stock, open])

  const queryClient = useQueryClient()
  
  const handleChange = useCallback((field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    setError('')
  }, [])

  const handleSave = useCallback(() => {
    try {
      if (!formData.ticker || !formData.quantity || !formData.name) {
        setError('All fields are required')
        return
      }

      const quantityNum = Number(formData.quantity)
      if (isNaN(quantityNum) || quantityNum <= 0) {
        setError('Please enter a valid quantity')
        return
      }

      const newStock: Stock = {
        symbol: formData.ticker.toUpperCase(),
        quantity: quantityNum,
        name: formData.name
      }

      const updatedPortfolio = stock
        ? portfolioData.map(s => s.symbol === stock.symbol ? newStock : s)
        : [...portfolioData, newStock]

      updatePortfolioData(updatedPortfolio)
      // Invalidate and refetch portfolio data
      queryClient.invalidateQueries({ queryKey: ['stock-prices'] })
      onOpenChange(false)
    } catch (err) {
      setError('Failed to update portfolio. Please try again.')
    }
  }, [formData, stock, onOpenChange, queryClient])

  const inputStyle = useMemo(() => ({
    backgroundColor: "$backgroundHover",
    borderColor: "$borderColor",
    color: "$color",
    fontSize: 14,
    height: 40,
    borderRadius: 8,
    paddingHorizontal: "$2",
  }), [])

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={stock ? 'Edit Stock' : 'Add Stock'}
    >
      <YStack gap="$3" paddingVertical="$2">
        <YStack>
          <Text color="$colorSubdued" fontSize={12} marginBottom="$1">
            Ticker Symbol
          </Text>
          <Input
            value={formData.ticker}
            onChangeText={(v) => handleChange('ticker', v)}
            placeholder="e.g. AAPL"
            placeholderTextColor="$colorSubdued"
            autoCapitalize="characters"
            disabled={!!stock}
            opacity={!!stock ? 0.6 : 1}
            {...inputStyle}
          />
        </YStack>

        <YStack>
          <Text color="$colorSubdued" fontSize={12} marginBottom="$1">
            Quantity
          </Text>
          <Input
            value={formData.quantity}
            onChangeText={(v) => handleChange('quantity', v.replace(/[^0-9]/g, ''))}
            placeholder="Number of shares"
            placeholderTextColor="$colorSubdued"
            keyboardType="numeric"
            {...inputStyle}
          />
        </YStack>

        <YStack>
          <Text color="$colorSubdued" fontSize={12} marginBottom="$1">
            Company Name
          </Text>
          <Input
            value={formData.name}
            onChangeText={(v) => handleChange('name', v)}
            placeholder="e.g. Apple Inc"
            placeholderTextColor="$colorSubdued"
            disabled={!!stock}
            opacity={!!stock ? 0.6 : 1}
            {...inputStyle}
          />
        </YStack>

        {error && (
          <Text 
            color="$red10" 
            fontSize={12} 
            textAlign="center"
            backgroundColor="$red2"
            padding="$2"
            borderRadius={6}
          >
            {error}
          </Text>
        )}

        <Button
          backgroundColor={primaryColor}
          height={40}
          borderRadius={8}
          opacity={!formData.ticker || !formData.quantity || !formData.name ? 0.5 : 1}
          disabled={!formData.ticker || !formData.quantity || !formData.name}
          pressStyle={{ opacity: 0.8, scale: 0.98 }}
          onPress={handleSave}
        >
          <Text color="#fff" fontWeight="500" fontSize={14}>
            {stock ? 'Update Stock' : 'Add Stock'}
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  )
}
