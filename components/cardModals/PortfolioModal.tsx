import React, { useState, useCallback } from 'react'
import { useColorScheme, StyleSheet } from 'react-native'
import { YStack, Text, XStack, ScrollView, Button, Input } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { BaseCardModal } from './BaseCardModal'
import { usePortfolioStore, updatePrincipal } from '@/store/PortfolioStore'
import { portfolioData } from '@/utils/Portfolio'
import { Stock } from '@/types'
import { useUserStore } from '@/store/UserStore'
import { EditStockModal } from './EditStockModal'
import { getValueColor } from '@/constants/valueHelper'
import Animated, { FadeIn } from 'react-native-reanimated'

interface PortfolioModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function PortfolioModal({ open, onOpenChange }: PortfolioModalProps) {
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedStock, setSelectedStock] = useState<Stock | undefined>()
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  const { prices, totalValue, principal } = usePortfolioStore()
  const currentTotalValue = totalValue ?? 0
  const [isEditingPrincipal, setIsEditingPrincipal] = useState(false)
  const [principalInput, setPrincipalInput] = useState(principal.toString())
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const getStockValueColor = (value: number): string => {
    const color = getValueColor('portfolio', value, '')
    if (!isDark) {
      if (color === '#22c55e') return '#15803d'
      if (color === '#ef4444') return '#b91c1c'
    }
    return color
  }

  const iconButtonStyle = {
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  }

  const styles = StyleSheet.create({
    card: {
      backgroundColor: isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)",
      borderRadius: 12,
      padding: 10,
      borderWidth: 1,
      borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)",
    }
  })

  const calculateROI = () => {
    if (!principal || principal === 0) return 0;
    return ((currentTotalValue - principal) / principal) * 100;
  };

  const roi = calculateROI();

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Portfolio"
    >
      <YStack gap="$4" paddingTop="$1">
        <YStack>
          <Animated.View 
            entering={FadeIn.duration(600)}
            style={styles.card}
          >
            <YStack gap="$1.5" paddingHorizontal="$2">
              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? "#999" : "#666"} fontSize={14}>Value</Text>
                <Text 
                  color={getStockValueColor(currentTotalValue)} 
                  fontSize={14} 
                  fontWeight="600"
                >
                  ${currentTotalValue.toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Text>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? "#999" : "#666"} fontSize={14}>Principal</Text>
                {isEditingPrincipal ? (
                  <Input
                    value={principalInput}
                    onChangeText={(v) => setPrincipalInput(v.replace(/[^0-9.]/g, ''))}
                    keyboardType="numeric"
                    autoFocus
                    onBlur={() => {
                      const newValue = parseFloat(principalInput)
                      if (!isNaN(newValue) && newValue >= 0) {
                        updatePrincipal(newValue)
                      }
                      setIsEditingPrincipal(false)
                    }}
                    backgroundColor="$backgroundHover"
                    borderColor="$borderColor"
                    height={24}
                    textAlign="right"
                    fontSize={14}
                    width={110}
                  />
                ) : (
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    color={isDark ? '#ef4444' : '#b91c1c'}
                    onPress={() => {
                      setIsEditingPrincipal(true)
                      setPrincipalInput(principal.toString())
                    }}
                  >
                    ${principal.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2
                    })}
                  </Text>
                )}
              </XStack>

              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? "#999" : "#666"} fontSize={14}>P/L</Text>
                <Text 
                  color={getStockValueColor(currentTotalValue - principal)} 
                  fontSize={14} 
                  fontWeight="600"
                >
                  ${(currentTotalValue - principal).toLocaleString('en-US', { 
                    minimumFractionDigits: 2, 
                    maximumFractionDigits: 2 
                  })}
                </Text>
              </XStack>

              <XStack justifyContent="space-between" alignItems="center">
                <Text color={isDark ? "#999" : "#666"} fontSize={12}>ROI</Text>
                <Text
                  color={getStockValueColor(roi)}
                  fontSize={14}
                  fontWeight="600"
                >
                  {roi.toFixed(1)}%
                </Text>
              </XStack>
            </YStack>
          </Animated.View>
        </YStack>
        <YStack>
          <XStack justifyContent="space-between" alignItems="center" marginBottom="$3" paddingRight="$1">
            <Text color={isDark ? "#999" : "#666"} fontSize={14}>Holdings</Text>
            <Button
              unstyled
              onPress={() => {
                setSelectedStock(undefined)
                setEditModalOpen(true)
              }}
              padding="$1"
              pressStyle={{ opacity: 0.7 }}
              icon={
                <MaterialIcons 
                  name="add" 
                  size={32} 
                  color={isDark ? "#fff" : "#000"}
                />
              }
            />
          </XStack>

          <ScrollView 
            maxHeight={400} 
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <YStack gap="$2">
              {portfolioData.length === 0 ? (
                <YStack 
                  height={100} 
                  alignItems="center" 
                  justifyContent="center"
                  backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                  borderRadius={12}
                  padding="$4"
                  borderWidth={1}
                  borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                >
                  <Text color={isDark ? "#999" : "#666"} fontSize={14}>
                    No stocks added yet
                  </Text>
                  <Text color={isDark ? "#666" : "#999"} fontSize={14}>
                    Tap + to add your first stock
                  </Text>
                </YStack>
              ) : (
                portfolioData.map((stock, index) => {
                  const currentPrice = prices[stock.symbol] || 0
                  const totalValue = currentPrice * stock.quantity
                  
                  return (
                    <Animated.View 
                      key={stock.symbol}
                      entering={FadeIn.delay(index * 50)}
                      style={styles.card}
                    >
                      <XStack justifyContent="space-between" alignItems="center">
                        <YStack flex={1}>
                          <XStack alignItems="center" gap="$2">
                            <Text 
                              color={isDark ? "#fff" : "#000"} 
                              fontSize={16} 
                              fontWeight="500"
                            >
                              {stock.symbol}
                            </Text>
                            <Text 
                              color={isDark ? "#999" : "#666"} 
                              fontSize={12}
                            >
                              {stock.quantity} shares
                            </Text>
                          </XStack>
                          <Text 
                            color={isDark ? "#999" : "#666"} 
                            fontSize={12}
                          >
                            {stock.name}
                          </Text>
                        </YStack>

                        <YStack alignItems="flex-end" flex={1}>
                          <Text 
                            color={getStockValueColor(totalValue)} 
                            fontSize={16} 
                            fontWeight="500"
                          >
                            ${totalValue.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })}
                          </Text>
                          <Text 
                            color={isDark ? "#999" : "#666"} 
                            fontSize={12}
                          >
                            ${currentPrice.toLocaleString('en-US', { 
                              minimumFractionDigits: 2, 
                              maximumFractionDigits: 2 
                            })} / share
                          </Text>
                        </YStack>

                        <Button
                          icon={
                            <MaterialIcons 
                              name="edit" 
                              size={16} 
                              color={isDark ? "#fff" : "#000"} 
                            />
                          }
                          circular
                          {...iconButtonStyle}
                          marginLeft="$3"
                          pressStyle={{ opacity: 0.7 }}
                          onPress={() => {
                            setSelectedStock(stock)
                            setEditModalOpen(true)
                          }}
                        />
                      </XStack>
                    </Animated.View>
                  )
                })
              )}
            </YStack>
          </ScrollView>
        </YStack>
      </YStack>

      <EditStockModal
        open={editModalOpen}
        onOpenChange={setEditModalOpen}
        stock={selectedStock}
      />
    </BaseCardModal>
  )
}
