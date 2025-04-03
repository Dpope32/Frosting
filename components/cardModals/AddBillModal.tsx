import React, { useState, useEffect, useRef } from 'react'
import { Button, Input, Text, YStack, XStack, Slider, View, isWeb } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { BaseCardModal } from './BaseCardModal'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform, TouchableOpacity, ScrollView } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'
import { getOrdinalSuffix } from '@/store/BillStore'

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

  // Max slider value - you can adjust this as needed
  const MAX_AMOUNT = 1000

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
      onClose()
    }
  }

  // For native date picker (only used on web now)
  const onDateChange = (event: any, selectedDate?: Date) => {
    if (selectedDate) {
      setDueDate(selectedDate)
    }
    
    // Only hide the picker on mobile platforms
    if (Platform.OS !== 'web') {
      setShowDatePicker(Platform.OS === 'ios')
    }
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

  // Get formatted day with ordinal suffix (1st, 2nd, 3rd, etc.)
  const getFormattedDay = (day: number) => {
    return `${day}${getOrdinalSuffix(day)} of each month`;
  }

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

  // Simple Mobile Day Picker - without using FlatList
  const MobileDayPicker = () => {
    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    
    return (
      <View 
        style={{ 
          backgroundColor: isDark ? '#222' : '#f0f0f0', 
          borderRadius: 8,
          marginTop: 8,
          height: 200
        }}
      >
        {/* Use regular View components instead of FlatList to avoid VirtualizedList nesting */}
        <View>
          {days.map(day => (
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
                marginVertical: 2
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
        </View>
      </View>
    );
  };

  return (
    <BaseCardModal
      open={isVisible}
      onOpenChange={onClose}
      title="Add New Bill"

      showCloseButton={true}
      zIndex={200000}
      hideHandle={true}
    >
      <Animated.View 
        entering={FadeIn.duration(400)}
        style={{ width: '100%' }}
      >
        <View
          backgroundColor={isDark ? "#090909" : "#f8f8f8"}
          borderRadius={12}
          padding="$4"
          marginVertical="$2"
        >
          <YStack gap="$6" paddingVertical="$4">
            <Animated.View entering={FadeInDown.delay(100).duration(500)}>
              <XStack gap="$4" alignItems="center">
                <Input
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
                <XStack alignItems="center" flex={1} justifyContent="flex-end" paddingHorizontal="$1">
                  <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$6" : "$4"} fontWeight="500">
                    ${formattedAmount}
                  </Text>
                </XStack>
              </XStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <XStack gap="$4" alignItems="center" paddingHorizontal="$2">
                <XStack alignItems="center" width="30%">
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
                
                <XStack alignItems="center" flex={1}>
                  <Slider
                    value={[sliderValue]}
                    onValueChange={handleAmountChange}
                    step={5}
                    flex={1}
                    max={MAX_AMOUNT}
                  >
                    <Slider.Track backgroundColor={isDark ? "$gray5" : "$gray3"} height={4} br={8}>
                      <Slider.TrackActive backgroundColor={primaryColor} />
                    </Slider.Track>
                    <Slider.Thumb 
                      index={0} 
                      width={isWeb ? 16 : 8}
                      height={isWeb ? 16 : 8}
                      backgroundColor={primaryColor}
                      br={isWeb ? 8 : 4}
                      shadowColor="black"
                      shadowOffset={{ width: 0, height: 1 }}
                      shadowOpacity={0.15}
                      shadowRadius={1}
                      elevation={1}
                    />
                  </Slider>
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
              <XStack gap="$3" justifyContent="flex-end" marginTop="$2">
                <Button
                  onPress={onClose}
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  fontFamily="$body"
                  fontSize={isWeb ? "$5" : "$4"}
                  paddingHorizontal="$4"
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
                >
                  Save
                </Button>
              </XStack>
            </Animated.View>
          </YStack>
        </View>
      </Animated.View>
    </BaseCardModal>
  )
}