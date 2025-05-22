import React from 'react'
import { Text } from 'tamagui'
import { getIconForStock } from '@/constants'

export const renderStockIcon = (symbol: string, size: number, color: string) => {
  try {
    const iconData = getIconForStock(symbol)
    const { Component, type } = iconData
    if (type === 'lucide') {
      return <Component size={size} color={color} />
    } else if (type === 'brand' || type === 'solid') {
      return <Component name={iconData.name} size={size} color={color} />
    } else if (type === 'material') {
      return <Component name={iconData.name} size={size} color={color} />
    }
    return <Text fontSize={size} color={color}>$</Text>
  } catch (err) {
    console.error(`Error rendering icon for ${symbol}:`, err)
    return <Text fontSize={size} color={color}>$</Text>
  }
}