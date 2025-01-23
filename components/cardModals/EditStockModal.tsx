import React, { useState } from 'react'
import { YStack, Text, XStack, Input, Button } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { Stock } from '@/types'
import { portfolioData, updatePortfolioData } from '../../utils/Portfolio'

interface EditStockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  stock?: Stock
}

export function EditStockModal({ open, onOpenChange, stock }: EditStockModalProps) {
  const [ticker, setTicker] = useState(stock?.symbol || '')
  const [quantity, setQuantity] = useState(stock?.quantity.toString() || '')
  const [name, setName] = useState(stock?.name || '')
  const [error, setError] = useState('')

  const handleSave = () => {
    if (!ticker || !quantity || !name) {
      setError('All fields are required')
      return
    }

    const newStock: Stock = {
      symbol: ticker.toUpperCase(),
      quantity: Number(quantity),
      name
    }

    const updatedPortfolio = stock
      ? portfolioData.map(s => s.symbol === stock.symbol ? newStock : s)
      : [...portfolioData, newStock];
    
    updatePortfolioData(updatedPortfolio);

    // Reset form and close modal
    setTicker('')
    setQuantity('')
    setName('')
    setError('')
    onOpenChange(false)
  }

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={stock ? 'Edit Stock' : 'Add New Stock'}
    >
      <YStack gap="$4">
        <YStack>
          <Text color="#fff" fontSize={14} marginBottom="$2">Ticker Symbol</Text>
          <Input
            value={ticker}
            onChangeText={setTicker}
            placeholder="e.g. AAPL"
            backgroundColor="rgba(35,35,35,0.8)"
            borderColor="rgba(85,85,85,0.5)"
            color="#fff"
            disabled={!!stock}
          />
        </YStack>

        <YStack>
          <Text color="#fff" fontSize={14} marginBottom="$2">Quantity</Text>
          <Input
            value={quantity}
            onChangeText={setQuantity}
            placeholder="Number of shares"
            keyboardType="numeric"
            backgroundColor="rgba(35,35,35,0.8)"
            borderColor="rgba(85,85,85,0.5)"
            color="#fff"
          />
        </YStack>

        <YStack>
          <Text color="#fff" fontSize={14} marginBottom="$2">Company Name</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="e.g. Apple Inc"
            backgroundColor="rgba(35,35,35,0.8)"
            borderColor="rgba(85,85,85,0.5)"
            color="#fff"
            disabled={!!stock}
          />
        </YStack>

        {error && (
          <Text color="#FF5252" fontSize={14}>{error}</Text>
        )}

        <Button
          backgroundColor="$blue10"
          height={45}
          pressStyle={{ opacity: 0.8 }}
          onPress={handleSave}
          marginTop="$2"
        >
          <Text color="#fff" fontWeight="500">
            {stock ? 'Update Stock' : 'Add Stock'}
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  )
}
