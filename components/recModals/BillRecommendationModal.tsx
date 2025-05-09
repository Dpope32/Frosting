import React, { useState, useRef, useEffect } from 'react'
import { useColorScheme, TextInput } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox, Circle, isWeb, Card, Input, Paragraph } from 'tamagui'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import { useBills } from '@/hooks/useBills'
import { BillRecommendationCategory, getRecommendedBills} from '@/constants/recommendations/BillRecommendations'
import { useUserStore } from '@/store/UserStore'
import { isIpad } from '@/utils/deviceUtils'

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
  const [createTaskFlags, setCreateTaskFlags] = useState<Record<number, boolean>>({})
  const [validationErrors, setValidationErrors] = useState<Record<number, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const scrollViewRef = useRef<ScrollView>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)
  const primaryColor = useUserStore(s => s.preferences.primaryColor)

  useEffect(() => {
    if (!open) {
      setSelectedBills({});
      setAmounts({});
      setDueDates({});
      setCreateTaskFlags({});
      setValidationErrors({});
    }
  }, [open]);

  const handleToggleBill = (index: number) => {
    setSelectedBills(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const handleToggleCreateTask = (index: number) => {
    setCreateTaskFlags(prev => ({
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
        dueDate: dueDate,
        createTask: createTaskFlags[index] || false // Add the createTask flag
      })
      billsAdded++
    }
    
    // Note: Need to update Bill type and addBills function in useBills.ts later
    
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
            {recommendedBills.map((bill, index) => {
              const isSelected = selectedBills[index] || false
              const hasError = !!validationErrors[index]
              
              return (
                <Card
                  key={index}
                  elevate={isSelected}
                  bordered={!isSelected}
                  scale={isSelected ? 0.98 : 1}
                  opacity={isSelected ? 1 : 0.8}
                  backgroundColor={isSelected ? '$backgroundFocus' : '$background'}
                  borderColor={hasError ? '$red10' : (isSelected ? '$borderColorFocus' : '$borderColor')}
                  padding="$3"
                  gap="$3"
                >
                  <XStack alignItems="center" gap="$3">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleBill(index)}
                      size="$5"
                      backgroundColor={isSelected ? isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(113, 113, 113, 0.5)' : '$gray5'}
                      borderColor={isSelected ? primaryColor : '$borderColor'}
                    >
                      <Checkbox.Indicator>
                        <Ionicons name="checkmark" size={isIpad() ? 20 : 18} color="rgb(77, 255, 0)" />
                      </Checkbox.Indicator>
                    </Checkbox>
                    <Text flex={1} fontSize={isIpad() ? 18 : 15} fontWeight="500" fontFamily="$body" color="$color">
                      {bill.name}
                    </Text>
                  </XStack>

                  {isSelected && (
                    <YStack gap="$3" pl="$6">
                      <XStack gap="$3" alignItems="flex-start"> 
                        <YStack flex={1} gap="$1" minWidth={90}> 
                          <XStack alignItems="center" gap="$1.5">
                            <Ionicons name="cash-outline" size={isIpad() ? 15 : 14} color="$colorFocus" />
                            <Text fontSize={isIpad() ? 14 : 13} fontWeight="500" fontFamily="$body" color="$colorPress">Amount</Text>
                          </XStack>
                          <XStack
                            borderWidth={1}
                            borderColor={hasError && (!amounts[index] || parseFloat(amounts[index]) <= 0) ? '$red10' : '$borderColor'}
                            borderRadius="$3"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            alignItems="center"
                            backgroundColor="$background"
                            gap="$1"
                          >
                            <Text color="$colorPress" fontSize={12}>$</Text>
                            <Input
                              unstyled
                              flex={1}
                              keyboardType="decimal-pad"
                              value={amounts[index] || ''}
                              onChangeText={(value) => handleAmountChange(index, value)}
                              placeholder="0.00"
                              placeholderTextColor="$colorPress"
                              color="$color"
                              fontSize={14}
                              paddingVertical={0}
                              height={30} 
                            />
                          </XStack>
                        </YStack>

                        <YStack flex={1} gap="$1" minWidth={80}>
                           <XStack alignItems="center" gap="$1.5">
                            <Ionicons name="calendar-outline" size={14} color="$colorFocus" />
                            <Text fontSize={isIpad() ? 14 : 13} fontWeight="500" fontFamily="$body" color="$colorPress">Due Day</Text>
                          </XStack>
                          <XStack
                            borderWidth={1}
                            borderColor={hasError && (!dueDates[index] || parseInt(dueDates[index]) < 1 || parseInt(dueDates[index]) > 31) ? '$red10' : '$borderColor'}
                            borderRadius="$3"
                            paddingHorizontal="$2"
                            paddingVertical="$1"
                            alignItems="center"
                            backgroundColor="$background"
                          >
                            <Input
                              unstyled
                              flex={1}
                              keyboardType="number-pad"
                              value={dueDates[index] || ''}
                              onChangeText={(value) => handleDueDateChange(index, value)}
                              placeholder="1-31"
                              placeholderTextColor="$colorPress"
                              color="$color"
                              fontSize={14}
                              maxLength={2}
                              paddingVertical={0}
                              height={30}
                            />
                          </XStack>
                        </YStack>

                        <YStack flex={1} gap="$1" minWidth={90} justifyContent="center"  alignItems="center">
                          <XStack alignItems="center" gap="$1.5">
                          {!isIpad() && <Text fontSize={isIpad() ? 14 : 13} fontWeight="500" fontFamily="$body" color="$colorPress">Create Task </Text>}
                           {isIpad() &&  <Text fontSize={isIpad() ? 14 : 13} fontWeight="500" fontFamily="$body" color="$colorPress">See Task on Due Date?</Text>}
                          </XStack>
                          <Checkbox
                            checked={createTaskFlags[index] || false}
                            onCheckedChange={() => handleToggleCreateTask(index)}
                            size={isIpad() ? "$7" : "$7"}
                            backgroundColor={createTaskFlags[index] ? isDark ? 'rgba(46, 46, 46, 0.7)' : 'rgba(73, 73, 73, 0.5)': '$background'}
                            borderColor={createTaskFlags[index] ? primaryColor : '$borderColor'}
                            mt={isIpad() ? "$1.5" : "$1"}
                          >
                            <Checkbox.Indicator>
                              <Ionicons name="checkmark" size={isIpad() ? 18 : 16} color="rgba(38, 255, 0, 1)" />
                            </Checkbox.Indicator>
                          </Checkbox>
                        </YStack>
                      </XStack>
                      
                      {hasError && (
                        <Paragraph color="$red10" fontSize={12} pl="$1" mt="$1">
                          {validationErrors[index]}
                        </Paragraph>
                      )}
                    </YStack>
                  )}
                </Card>
              )
            })}
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
            color={isDark ? "#dbd0c6" : "#ffffff"}
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
