import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Text, YStack, XStack, View, isWeb, Spinner } from 'tamagui'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { getOrdinalSuffix, useUserStore } from '@/store'
import { useAutoFocus } from '@/hooks'
import { Bill } from '@/types'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'

interface EditBillModalProps {
  isVisible: boolean
  onClose: () => void
  bill: Bill | null
  onSubmit: (entry: { id: string; name: string; amount: number; dueDate: number }) => void
}

export function EditBillModal({ isVisible, onClose, bill, onSubmit }: EditBillModalProps): JSX.Element {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [amountInputValue, setAmountInputValue] = useState('')
  const [dueDate, setDueDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [sliderValue, setSliderValue] = useState(0)
  const [inputError, setInputError] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const amountInputRef = useRef<any>(null)
  const nameInputRef = useRef<any>(null)
  useAutoFocus(nameInputRef, 1000, isVisible)
  const MAX_AMOUNT = 1000
  
  // Debug: Log the onSubmit function only once when modal opens
  useEffect(() => {
    if (isVisible) {
      console.log('🔗 EditBillModal onSubmit function:', onSubmit?.name || 'anonymous function')
    }
  }, [isVisible])

  useEffect(() => {
    if (isVisible && bill) {
      setName(bill.name)
      setAmount(bill.amount)
      setAmountInputValue(bill.amount.toString())
      const d = new Date()
      d.setDate(bill.dueDate)
      setDueDate(d)
      setSliderValue(bill.amount)
      setShowDatePicker(false)
    }
  }, [isVisible, bill])

  const handleSubmit = async () => {
    console.log('🚀 EditBillModal handleSubmit called');
    console.log('📋 Current state:', { bill, name, amount, dueDate: dueDate.getDate() });
    console.log('✅ Validation check:', { 
      hasBill: !!bill, 
      hasName: !!name, 
      hasValidAmount: amount > 0, 
      hasDueDate: !!dueDate 
    });
    
    if (bill && name && amount > 0 && dueDate) {
      console.log('✅ Validation passed, calling onSubmit with:', {
        id: bill.id,
        name,
        amount,
        dueDate: dueDate.getDate()
      });
      
      setIsUpdating(true);
      
      try {
        await onSubmit({
          id: bill.id,
          name,
          amount,
          dueDate: dueDate.getDate()
        });
        console.log('✅ onSubmit completed successfully');
      } catch (error) {
        console.error('❌ onSubmit failed:', error);
      } finally {
        setIsUpdating(false);
      }
    } else {
      console.log('❌ Validation failed, not calling onSubmit');
    }
    
    console.log('🔚 Calling onClose...');
    onClose()
  }


  const formattedAmount = amount.toFixed(2)
  const isButtonDisabled = !name.trim() || !amount || !dueDate

  const DatePicker = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    return (
      <View style={{ marginTop: 10, backgroundColor: isDark ? '#222' : '#f0f0f0', padding: 15, borderRadius: 8 }}>
        <Text fontFamily="$body" color="$color" fontSize="$4" marginBottom="$2">Select day of month:</Text>
        <XStack flexWrap="wrap" gap="$2" justifyContent="flex-start">
          {days.map(day => (
            <TouchableOpacity key={day} onPress={() => { const newDate = new Date(); newDate.setDate(day); setDueDate(newDate); }} style={{ backgroundColor: dueDate.getDate() === day ? primaryColor : (isDark ? '#444' : '#ddd'), padding: 10, borderRadius: 6, width: 38, alignItems: 'center', margin: 2 }}>
              <Text fontFamily="$body" color={dueDate.getDate() === day ? (isDark ? '#000' : '#fff') : '$color'} fontSize="$4">{day}</Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </View>
    )
  }

  return (
    <>
      {isUpdating && (
        <YStack
          position="absolute"
          top={0} 
          left={0}
          right={0}
          bottom={0}
          zIndex={2000}
          alignItems="center"
          justifyContent="center"
          backgroundColor={isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)"}
        >
          <XStack
            backgroundColor={isDark ? "#222" : "white"}
            padding="$4"
            borderRadius="$4"
            alignItems="center"
            gap="$3"
            shadowColor="black"
            shadowOffset={{ width: 0, height: 4 }}
            shadowOpacity={0.2}
            shadowRadius={8}
            elevation={8}
          >
            <Spinner size="large" color={primaryColor} />
            <YStack>
              <Text fontWeight="600" color={isDark ? "white" : "black"}>Updating bill...</Text>
              <Text fontSize={12} color={isDark ? "#aaa" : "#666"}>This may take a moment</Text>
            </YStack>
          </XStack>
        </YStack>
      )}
      
      <BaseCardModal open={isVisible} onOpenChange={onClose} showCloseButton={true} hideHandle={true} title="Edit Bill" 
      footer={
        <XStack width="100%" px="$0" py="$2" justifyContent="space-between">
        <Button onPress={onClose} backgroundColor="rgba(255, 4, 4, 0.1)" borderColor="$borderColor" fontFamily="$body" fontSize={isWeb ? "$5" : "$4"} paddingHorizontal="$4" color={isDark ? "$red10" : "$red10"} flex={1} marginRight="$2">Cancel</Button>
        <Button onPress={() => { console.log('💾 Save button clicked!'); handleSubmit(); }} backgroundColor={primaryColor} disabled={isButtonDisabled} fontFamily="$body" fontSize={isWeb ? "$5" : "$4"} paddingHorizontal="$4" color={isDark ? "$white" : "#fff"} flex={1} marginLeft="$2">Save</Button>
      </XStack>
      }>
      <Animated.View entering={FadeIn.duration(400)} style={{ width: '100%' }}>
        <View borderRadius={12} paddingHorizontal={isWeb ? "$2" : "$2"} paddingVertical={isWeb ? "$2" : "$1"}>
          <YStack gap="$4">
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <XStack gap="$4" alignItems="center">
                <Input ref={nameInputRef} placeholder="Bill Name" value={name} onChangeText={setName} autoCapitalize="sentences" backgroundColor="$backgroundHover" borderColor="$borderColor" placeholderTextColor="$placeholderColor" color="$color" fontFamily="$body" width="70%" fontSize={isWeb ? "$5" : "$4"} />
                <XStack alignItems="center" flex={1} justifyContent="flex-end" paddingLeft="$1" paddingRight="$2">
                  <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$6" : "$4"} fontWeight="500">${formattedAmount}</Text>
                </XStack>
              </XStack>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <XStack gap="$5" alignItems="flex-start" justifyContent="flex-start" paddingHorizontal="$1">
                <XStack alignItems="flex-start" width="40%">
                  <Input ref={amountInputRef} placeholder="Amount" value={amountInputValue} onChangeText={(text) => { try { const sanitizedText = text.replace(/[^0-9.]/g, ''); const parts = sanitizedText.split('.'); let formattedText = sanitizedText; if (parts.length > 2) { formattedText = parts[0] + '.' + parts.slice(1).join(''); } if (parts.length > 1 && parts[1].length > 2) { formattedText = parts[0] + '.' + parts[1].substring(0, 2); } setAmountInputValue(formattedText); const value = parseFloat(formattedText); if (!isNaN(value) && value <= MAX_AMOUNT) { const roundedValue = Math.floor(value * 100) / 100; setAmount(roundedValue); setSliderValue(roundedValue); setInputError(false); } else if (formattedText === '' || formattedText === '0') { setAmount(0); setSliderValue(0); setInputError(false); } } catch { setInputError(true); } }} keyboardType="decimal-pad" backgroundColor="$backgroundHover" borderColor="$borderColor" placeholderTextColor="$placeholderColor" color="$color" fontFamily="$body" fontSize={isWeb ? "$5" : "$4"} flex={1} />
                </XStack>
              </XStack>
            </Animated.View>
            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <YStack gap="$4">
                <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)} activeOpacity={0.7}>
                  <XStack backgroundColor="$backgroundHover" borderColor="$borderColor" borderWidth={1} br={8} padding="$3" alignItems="center" justifyContent="space-between">
                    <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$5" : "$4"}>{dueDate.getDate()}{getOrdinalSuffix(dueDate.getDate())} of each month</Text>
                    <Ionicons name="calendar" size={isWeb ? 24 : 20} color={isDark ? "#fff" : "#000"} />
                  </XStack>
                </TouchableOpacity>
                {showDatePicker && <DatePicker />}
              </YStack>
            </Animated.View>
          </YStack>
        </View>
      </Animated.View>
    </BaseCardModal>
    </>
  )
}
