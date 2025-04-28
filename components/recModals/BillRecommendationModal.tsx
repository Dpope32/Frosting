import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useColorScheme, TextInput } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox, Circle, isWeb } from 'tamagui'
import { BaseCardModal } from '../cardModals/BaseCardModal'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { useBills } from '@/hooks/useBills'
import { BillRecommendationCategory, getRecommendedBills} from '@/constants/recommendations/BillRecommendations'
import { useUserStore } from '@/store/UserStore'

type DebouncedTextInputProps = {
  value: string
  onDebouncedChange: (value: string) => void
  style?: any
  keyboardType?: string
  placeholder?: string
  placeholderTextColor?: string
}

export const DebouncedTextInput = ({
  value,
  onDebouncedChange,
  style,
  keyboardType = 'default',
  placeholder = '',
  placeholderTextColor = 'gray'
}: DebouncedTextInputProps) => {
  const [text, setText] = useState(value)
  
  useEffect(() => {
    setText(value)
  }, [value])
  
  useEffect(() => {
    const handler = setTimeout(() => {
      onDebouncedChange(text)
    }, 100)
    
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
  const { addBills } = useBills()
  const [selectedBills, setSelectedBills] = useState<Record<number, boolean>>({})
  const [amounts, setAmounts] = useState<Record<number, string>>({})
  const [dueDates, setDueDates] = useState<Record<number, string>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const primaryColor = useUserStore(s => s.preferences.primaryColor)
  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedBills({});
      setAmounts({});
      setDueDates({});
      setValidationErrors({});
    }
  }, [open]);

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
  
  const handleSaveSelectedBills = async () => {
    setIsSaving(true)
    setValidationErrors({})
    
    const billsToAdd = []
    let billsAdded = 0
    const errors: Record<number, string> = {}
    
    const recommendedBills = getRecommendedBills(category)
    
    for (const [indexStr, isSelected] of Object.entries(selectedBills)) {
      if (!isSelected) continue
      
      const index = parseInt(indexStr)
      const amount = parseFloat(amounts[index] || '0')
      const dueDate = parseInt(dueDates[index] || '0')
      
      if (amount <= 0) {
        errors[index] = 'Please enter a valid amount'
        continue
      }
      
      if (dueDate < 1 || dueDate > 31) {
        errors[index] = 'Please enter a valid due date (1-31)'
        continue
      }
      
      billsToAdd.push({
        name: recommendedBills[index].name,
        amount: amount,
        dueDate: dueDate
      })
      billsAdded++
    }
    
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      setIsSaving(false)
      return
    }
    
    if (billsToAdd.length > 0) {
      await addBills(billsToAdd, { 
        showToastNotification: true,
        batchCategory: category
      })
    }
    
    setIsSaving(false)
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
      onOpenChange={(newOpen) => { onOpenChange(newOpen)}}
      title={`${category} Bills`}
      snapPoints = {isWeb ? [90] : [85]}
      zIndex={200000}
      showCloseButton={true}
      hideHandle={true}
    >
      <YStack gap="$4" px="$1" paddingBottom={isWeb ? "$4" : "$8"}>
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
                br={12}
                padding="$3"
                borderWidth={1}
                borderColor={validationErrors[index] ? (isDark ? "#ff4444" : "#ff0000") : (isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)")}
                alignItems="center"
              >
                <Checkbox
                  checked={selectedBills[index] || false}
                  onCheckedChange={() => handleToggleBill(index)}
                  backgroundColor={selectedBills[index] ? "#000" : "#F5F5DC"}
                  borderColor={selectedBills[index] ? "#000" : "#D3D3D3"}
                  marginRight="$2.5"
                >
                  {selectedBills[index] && (
                    <Checkbox.Indicator>
                      <Ionicons name="checkmark" size={16} color="#00C851" />
                    </Checkbox.Indicator>
                  )}
                </Checkbox>

                <YStack flex={1} gap="$2" opacity={selectedBills[index] ? 0.6 : 1}>
                  <Text
                    color={isDark ? "#fff" : "#000"}
                    fontSize={15}
                    fontWeight="500"
                    fontFamily={"$body"}
                  >
                    {bill.name}
                  </Text>

                  {selectedBills[index] && (
                    <YStack gap="$2" flex={1}>
                      <XStack gap="$2" flexWrap="wrap">
                        <XStack alignItems="center" gap="$1" flex={1} minWidth={120}>
                          <Ionicons name="cash-outline" size={16} color={isDark ? "#999" : "#666"} />
                          <Text fontFamily={"$body"} color={isDark ? "#999" : "#666"} fontSize={12} marginRight="$1">
                            Amount:
                          </Text>
                          <XStack
                            backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                            px="$2"
                            py="$1"
                            br={4}
                            flex={1}
                            alignItems="center"
                            borderColor={validationErrors[index] ? (isDark ? "#ff4444" : "#ff0000") : "transparent"}
                            borderWidth={validationErrors[index] ? 1 : 0}
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
                            px="$2"
                            py="$1"
                            br={4}
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
                      {validationErrors[index] && (
                        <Text color={isDark ? "#ff4444" : "#ff0000"} fontSize={12}>
                          {validationErrors[index]}
                        </Text>
                      )}
                    </YStack>
                  )}
                </YStack>
              </XStack>
            ))}
          </YStack>
        </ScrollView>
        
        <Button
          backgroundColor={primaryColor}
          color={isDark ? "#dbd0c6" : "#000"}
          br={8}
          py="$3"
          mt="$4"
          onPress={handleSaveSelectedBills}
          pressStyle={{ opacity: 0.7 }}
          disabled={!hasValidSelections || isSaving}
          opacity={!hasValidSelections || isSaving ? 0.5 : 1}
        >
          <Text
            color={isDark ? "#dbd0c6" : "#000"}
            fontSize={16}
            fontWeight="600"
            fontFamily={"$body"}
            opacity={!hasValidSelections || isSaving ? 0.5 : 1}
          >
            {isSaving ? "Saving..." : "Add Selected Bills"}
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
