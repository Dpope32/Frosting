import React, { useState, useCallback, useRef, useEffect } from 'react'
import { useColorScheme, TextInput } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox, Circle, isWeb } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { useBills } from '@/hooks/useBills'
import {
  BillRecommendationCategory,
  RecommendedBill,
  getRecommendedBills
} from '@/utils/BillRecommendations'

// Custom debounced input component
type DebouncedTextInputProps = {
  value: string
  onDebouncedChange: (value: string) => void
  style?: any
  keyboardType?: string
}

const DebouncedTextInput = ({
  value,
  onDebouncedChange,
  style,
  keyboardType = 'default'
}: DebouncedTextInputProps) => {
  const [text, setText] = useState(value)
  
  // Update internal state when prop value changes
  useEffect(() => {
    setText(value)
  }, [value])
  
  // Debounce the change notification
  useEffect(() => {
    const handler = setTimeout(() => {
      onDebouncedChange(text)
    }, 300)
    
    return () => clearTimeout(handler)
  }, [text, onDebouncedChange])
  
  return (
    <TextInput
      value={text}
      onChangeText={setText}
      style={style}
      keyboardType={keyboardType as any}
    />
  )
}

interface BillRecommendationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: BillRecommendationCategory
}

export function BillRecommendationModal({
  open,
  onOpenChange,
  category
}: BillRecommendationModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { addBill } = useBills()
  const [selectedBills, setSelectedBills] = useState<Record<number, boolean>>({})
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [dueDates, setDueDates] = useState<Record<number, string>>({})
  const scrollViewRef = useRef<ScrollView>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  
  const handleToggleBill = (index: number) => {
    setSelectedBills(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  const handleAmountChange = (index: number, value: string) => {
    setAmounts(prev => ({
      ...prev,
      [index]: value
    }))
  }
  
  const handleDueDateChange = (index: number, value: string) => {
    setDueDates(prev => ({
      ...prev,
      [index]: value
    }))
  }
  
  const handleSaveSelectedBills = () => {
    const recommendedBills = getRecommendedBills(category)
    Object.entries(selectedBills).forEach(([indexStr, isSelected]) => {
      if (isSelected) {
        const index = parseInt(indexStr)
        const bill = recommendedBills[index]
        const amount = parseFloat(amounts[index] || '0')
        const dueDate = parseInt(dueDates[index] || '1', 10)
        
        if (amount > 0 && dueDate >= 1 && dueDate <= 31) {
          addBill({
            name: bill.name,
            amount: amount,
            dueDate: dueDate
          })
        }
      }
    })
    setSelectedBills({})
    setAmounts({})
    setDueDates({})
    onOpenChange(false)
  }
  
  const recommendedBills = getRecommendedBills(category)
  const hasValidSelections = Object.entries(selectedBills).some(([indexStr, isSelected]) => {
    if (isSelected) {
      const index = parseInt(indexStr)
      const amount = parseFloat(amounts[index] || '0')
      const dueDate = parseInt(dueDates[index] || '0', 10)
      return amount > 0 && dueDate >= 1 && dueDate <= 31
    }
    return false
  })
  
  return (
    <BaseCardModal
      open={open}
      onOpenChange={(newOpen) => {
        console.log(`BillRecommendationModal onOpenChange - category: ${category}, newOpen: ${newOpen}`)
        onOpenChange(newOpen)
      }}
      title={`${category} Bills`}
      snapPoints = {isWeb ? [90] : [85]}
      zIndex={200000}
    >
      <YStack gap="$4" paddingHorizontal="$1" paddingBottom={isWeb ? "$4" : "$8"}>
        <Text
          color={isDark ? "#dbd0c6" : "#666"}
          fontSize={16}
          fontFamily={"$body"}
          opacity={0.9}
        >
          Select bills to add to your list:
        </Text>
        
        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          bounces={false}
          maxHeight="100%"
          onScroll={(event) => {
            const scrollY = event.nativeEvent.contentOffset.y;
            setShowScrollToTop(scrollY > 100);
          }}
          scrollEventThrottle={16}
        >
          <YStack gap="$3">
            {recommendedBills.map((bill, index) => (
              <XStack
                key={index}
                backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                borderRadius={12}
                padding="$3"
                borderWidth={1}
                borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                alignItems="center"
              >
                <Checkbox
                  checked={selectedBills[index] || false}
                  onCheckedChange={() => handleToggleBill(index)}
                  backgroundColor={selectedBills[index] ? (isDark ? "#dbd0c6" : "#000") : "transparent"}
                  borderColor={isDark ? "#dbd0c6" : "#000"}
                  marginRight="$2.5"
                />
                
                <YStack flex={1} gap="$2">
                  <Text
                    color={isDark ? "#fff" : "#000"}
                    fontSize={15}
                    fontWeight="500"
                    fontFamily={"$body"}
                  >
                    {bill.name}
                  </Text>
                  
                  {selectedBills[index] && (
                    <XStack gap="$2" flexWrap="wrap">
                      <XStack alignItems="center" gap="$1" flex={1} minWidth={120}>
                        <Ionicons name="cash-outline" size={16} color={isDark ? "#999" : "#666"} />
                        <Text fontFamily={"$body"} color={isDark ? "#999" : "#666"} fontSize={12} marginRight="$1">
                          Amount:
                        </Text>
                        <XStack
                          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius={4}
                          flex={1}
                          alignItems="center"
                        >
                          <Text fontFamily={"$body"} color={isDark ? "#999" : "#666"} fontSize={12} marginRight="$1">
                            $
                          </Text>
                          <DebouncedTextInput
                            keyboardType="decimal-pad"
                            value={amounts[index] || ''}
                            onDebouncedChange={(value) => handleAmountChange(index, value)}
                            style={{
                              backgroundColor: 'transparent',
                              color: isDark ? '#fff' : '#000',
                              fontSize: 12,
                              padding: 0,
                              flex: 1,
                              height: 20
                            }}
                          />
                        </XStack>
                      </XStack>
                      
                      <XStack alignItems="center" gap="$1" flex={1} minWidth={120}>
                        <Ionicons name="calendar-outline" size={16} color={isDark ? "#999" : "#666"} />
                        <Text fontFamily={"$body"} color={isDark ? "#999" : "#666"} fontSize={12} marginRight="$1">
                          Due Date:
                        </Text>
                        <XStack
                          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius={4}
                          flex={1}
                          alignItems="center"
                        >
                          <DebouncedTextInput
                            keyboardType="number-pad"
                            value={dueDates[index] || ''}
                            onDebouncedChange={(value) => handleDueDateChange(index, value)}
                            style={{
                              backgroundColor: 'transparent',
                              color: isDark ? '#fff' : '#000',
                              fontSize: 12,
                              padding: 0,
                              flex: 1,
                              height: 20
                            }}
                          />
                        </XStack>
                      </XStack>
                    </XStack>
                  )}
                </YStack>
              </XStack>
            ))}
          </YStack>
        </ScrollView>
        
        <Button
          backgroundColor={isDark ? "rgba(219, 208, 198, 0.2)" : "rgba(0, 0, 0, 0.1)"}
          color={isDark ? "#dbd0c6" : "#000"}
          borderRadius={8}
          paddingVertical="$3"
          marginTop="$4"
          onPress={handleSaveSelectedBills}
          pressStyle={{ opacity: 0.7 }}
          disabled={!hasValidSelections}
          opacity={!hasValidSelections ? 0.5 : 1}
        >
          <Text
            color={isDark ? "#dbd0c6" : "#000"}
            fontSize={16}
            fontWeight="600"
          >
            Add Selected Bills
          </Text>
        </Button>
        
        {showScrollToTop && (
          <Circle
            size={44}
            backgroundColor={isDark ? "rgba(219, 208, 198, 0.2)" : "rgba(0, 0, 0, 0.1)"}
            position="absolute"
            bottom={70}
            right={10}
            opacity={0.9}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
            elevation={4}
            shadowColor="rgba(0,0,0,0.3)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.3}
            shadowRadius={3}
          >
            <AntDesign name="arrowup" size={24} color={isDark ? "#dbd0c6" : "#000"} />
          </Circle>
        )}
      </YStack>
    </BaseCardModal>
  )
}