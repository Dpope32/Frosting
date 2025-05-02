import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Text, YStack, XStack, View, isWeb, Slider } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import { Platform, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { getOrdinalSuffix } from '@/store/BillStore'
import { BaseCardAnimated } from './BaseCardAnimated'
import { useAutoFocus } from '@/hooks/useAutoFocus'

interface AddBillModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (entry: { name: string; amount: number; dueDate: number }) => void
}

export function AddBillModal({ isVisible, onClose, onSubmit }: AddBillModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [amountInputValue, setAmountInputValue] = useState('')
  const [dueDate, setDueDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(isWeb)
  const [sliderValue, setSliderValue] = useState(0)
  const [inputError, setInputError] = useState(false)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const amountInputRef = useRef<any>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  const nameInputRef = useRef<any>(null)
  useAutoFocus(nameInputRef, 1000, isVisible)

  // Max slider value - you can adjust this as needed
  const MAX_AMOUNT = 1000

  // Reset form when modal opens
  useEffect(() => {
    if (isVisible) {
      setName('')
      setAmount(0)
      setAmountInputValue('')
      setSliderValue(0)
      setDueDate(new Date())
    }
  }, [isVisible])


  const handleSubmit = () => {
    if (name && amount > 0 && dueDate) {
      onSubmit({
        name,
        amount,
        dueDate: dueDate.getDate() // Get the day of the month (1-31)
      })
      setName('')
      setAmount(0)
      setAmountInputValue('')
      setSliderValue(0)
      setDueDate(new Date())
    }
    onClose()
  }

  const handleAmountChange = (value: number[]) => {
    try {
      const newAmount = value[0]
      setSliderValue(newAmount)
      const fixedAmount = Math.floor(newAmount * 100) / 100
      setAmount(fixedAmount)
      setAmountInputValue(fixedAmount.toString())
      setInputError(false)
    } catch (error) {
      console.error("Error updating slider value:", error)
      setInputError(true)
    }
  }

  // Format amount for display only (not for input)
  const formattedAmount = amount.toFixed(2)

  // Set date picker visibility for web by default
  useEffect(() => {
    if (isWeb && isVisible) {
      setShowDatePicker(true)
    }
  }, [isVisible])

  // Custom Web Date Picker component - day selector only
  const WebDatePicker = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <View 
        style={{ 
          marginTop: 10,
          backgroundColor: isDark ? '#222' : '#f0f0f0',
          padding: 15,
          borderRadius: 8
        }}
      >
        <Text fontFamily="$body" color="$color" fontSize="$4" marginBottom="$2">
          Select day of month:
        </Text>
        <XStack flexWrap="wrap" gap="$2" justifyContent="flex-start">
          {days.map(day => (
            <TouchableOpacity 
              key={day}
              onPress={() => {
                const newDate = new Date();
                newDate.setDate(day);
                setDueDate(newDate);
              }}
              style={{
                backgroundColor: dueDate.getDate() === day ? primaryColor : (isDark ? '#444' : '#ddd'),
                padding: 10,
                borderRadius: 6,
                width: 38,
                alignItems: 'center',
                margin: 2
              }}
            >
              <Text 
                fontFamily="$body" 
                color={dueDate.getDate() === day ? (isDark ? '#000' : '#fff') : '$color'}
                fontSize="$4"
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </XStack>
      </View>
    );
  };

  return (
    <BaseCardAnimated
      onClose={onClose}
      showCloseButton={true}
      title="Add New Bill"
      visible={isVisible}
    >
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={{ width: '100%' }}
      >
        <View
          borderRadius={12}
          paddingHorizontal={ isWeb ? "$4" : "$3"}
          paddingVertical={ isWeb ? "$4" : "$1"}
        >
          <YStack gap="$4">
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <XStack gap="$4" alignItems="center">
                <Input
                  ref={nameInputRef}
                  placeholder="Bill Name"
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="sentences"
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  placeholderTextColor="$placeholderColor"
                  color="$color"
                  fontFamily="$body"
                  width="75%"
                  fontSize={isWeb ? "$5" : "$4"}
                />
                <XStack alignItems="center" flex={1} justifyContent="flex-end" paddingLeft="$1" paddingRight="$2">
                  <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$6" : "$4"} fontWeight="500">
                    ${formattedAmount}
                  </Text>
                </XStack>
              </XStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <XStack gap="$5" alignItems="flex-start" justifyContent="flex-start"  paddingHorizontal="$1">
                <XStack alignItems="flex-start" width="40%">
                  <Input
                    ref={amountInputRef}
                    placeholder="Amount"
                    value={amountInputValue}
                    onChangeText={(text) => {
                      try {
                        const sanitizedText = text.replace(/[^0-9.]/g, '');
                        
                        const parts = sanitizedText.split('.');
                        let formattedText = sanitizedText;
                        if (parts.length > 2) {
                          formattedText = parts[0] + '.' + parts.slice(1).join('');
                        }
                        
                        if (parts.length > 1 && parts[1].length > 2) {
                          formattedText = parts[0] + '.' + parts[1].substring(0, 2);
                        }
                        
                        setAmountInputValue(formattedText);
                        
                        const value = parseFloat(formattedText);
                        if (!isNaN(value) && value <= MAX_AMOUNT) {
                          const roundedValue = Math.floor(value * 100) / 100;
                          setAmount(roundedValue);
                          setSliderValue(roundedValue);
                          setInputError(false);
                        } else if (formattedText === '' || formattedText === '0') {
                          setAmount(0);
                          setSliderValue(0);
                          setInputError(false);
                        }
                      } catch (error) {
                        console.error("Error processing input:", error);
                        setInputError(true);
                      }
                    }}
                    keyboardType="decimal-pad"
                    backgroundColor="$backgroundHover"
                    borderColor="$borderColor"
                    placeholderTextColor="$placeholderColor"
                    color="$color"
                    fontFamily="$body"
                    fontSize={isWeb ? "$5" : "$4"}
                    flex={1}
                  />
                </XStack>
              </XStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300).duration(500)}>
              <YStack gap="$4">
                <TouchableOpacity onPress={() => setShowDatePicker(!showDatePicker)} activeOpacity={0.7}>
                  <XStack
                    backgroundColor="$backgroundHover"
                    borderColor="$borderColor"
                    borderWidth={1}
                    br={8}
                    padding="$3"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$5" : "$4"}>
                      {dueDate.getDate()}{getOrdinalSuffix(dueDate.getDate())} of each month
                    </Text>
                    <Ionicons name="calendar" size={isWeb ? 24 : 20} color={isDark ? "#fff" : "#000"} />
                  </XStack>
                </TouchableOpacity>
                
                {showDatePicker && (
                  isWeb ? (
                    <WebDatePicker />
                  ) : (
                    <ScrollView 
                      style={{ 
                        height: 200,
                        backgroundColor: isDark ? '#222' : '#f0f0f0',
                        borderRadius: 8,
                        marginTop: 8
                      }}
                      showsVerticalScrollIndicator={true}
                    >
                      {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                        <TouchableOpacity 
                          key={day}
                          onPress={() => {
                            const newDate = new Date();
                            newDate.setDate(day);
                            setDueDate(newDate);
                            setShowDatePicker(false);
                          }}
                          style={{
                            padding: 12,
                            borderRadius: 6,
                            backgroundColor: dueDate.getDate() === day ? primaryColor : 'transparent',
                            alignItems: 'center',
                            marginVertical: 2,
                            marginHorizontal: 8
                          }}
                        >
                          <Text 
                            fontFamily="$body" 
                            fontSize="$5"
                            fontWeight={dueDate.getDate() === day ? "600" : "400"}
                            color={dueDate.getDate() === day ? (isDark ? '#000' : '#fff') : '$color'}
                          >
                            {day}{getOrdinalSuffix(day)}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )
                )}
              </YStack>
            </Animated.View>
            
            <Animated.View entering={FadeInDown.delay(400).duration(500)}>
              <XStack gap="$3" justifyContent="space-between" marginTop="$2">
                <Button
                  onPress={onClose}
                  backgroundColor="rgba(255, 4, 4, 0.1)"
                  borderColor="$borderColor"
                  fontFamily="$body"
                  fontSize={isWeb ? "$5" : "$4"}
                  paddingHorizontal="$4"
                  color={isDark ? "$red10" : "$red10"}
                >
                  Cancel
                </Button>
                <Button
                  onPress={handleSubmit}
                  backgroundColor={primaryColor}
                  disabled={!name || amount <= 0}
                  fontFamily="$body"
                  fontSize={isWeb ? "$5" : "$4"}
                  paddingHorizontal="$4"
                  color={isDark ? "$white" : "#fff"}
                >
                  Save
                </Button>
              </XStack>
            </Animated.View>
          </YStack>
        </View>
      </Animated.View>
    </BaseCardAnimated>
  )
}