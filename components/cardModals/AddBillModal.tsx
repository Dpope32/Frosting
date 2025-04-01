import React, { useState, useEffect } from 'react'
import { Button, Input, Text, YStack, XStack, Slider, View, isWeb } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { BaseCardModal } from './BaseCardModal'
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Platform, TouchableOpacity } from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { useColorScheme } from 'react-native'

interface AddBillModalProps {
  isVisible: boolean
  onClose: () => void
  onSubmit: (entry: { name: string; amount: number; dueDate: number }) => void
}

export function AddBillModal({ isVisible, onClose, onSubmit }: AddBillModalProps) {
  const [name, setName] = useState('')
  const [amount, setAmount] = useState(0)
  const [dueDate, setDueDate] = useState(new Date())
  const [showDatePicker, setShowDatePicker] = useState(isWeb)
  const [sliderValue, setSliderValue] = useState(0)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

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
      setSliderValue(0)
      setDueDate(new Date())
      onClose()
    }
  }

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
    const newAmount = value[0]
    setSliderValue(newAmount)
    setAmount(parseFloat(newAmount.toFixed(2)))
  }

  // Format amount to have 2 decimal places
  const formattedAmount = amount.toFixed(2)

  // Set date picker visibility for web by default
  useEffect(() => {
    if (isWeb && isVisible) {
      setShowDatePicker(true)
    }
  }, [isVisible])

  // Custom Web Date Picker component
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
        <XStack flexWrap="wrap" gap="$6" justifyContent="flex-start">
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
                width: 44,
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
    <BaseCardModal
      open={isVisible}
      onOpenChange={onClose}
      title="Add New Bill"
      snapPoints={[80]}
      showCloseButton={true}
      zIndex={200000}
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
                  width="60%"
                  fontSize={isWeb ? "$5" : "$4"}
                />
                <XStack alignItems="center" flex={1} justifyContent="flex-end">
                  <Text fontFamily="$body" color="$color" fontSize={isWeb ? "$6" : "$4"} fontWeight="500">
                    ${formattedAmount}
                  </Text>
                </XStack>
              </XStack>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <XStack gap="$4" alignItems="center">
                <XStack alignItems="center" width="60%">
  
                  <Input
                    placeholder="Custom Amount"
                    value={formattedAmount === "0.00" ? "" : formattedAmount}
                    onChangeText={(text) => {
                      const value = parseFloat(text)
                      if (!isNaN(value) && value <= MAX_AMOUNT) {
                        setAmount(value)
                        setSliderValue(value)
                      } else if (text === '' || text === '0') {
                        setAmount(0)
                        setSliderValue(0)
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
                      width={isWeb ? 16 : 6}
                      height={isWeb ? 16 : 6}
                      backgroundColor={primaryColor}
                      br={isWeb ? 8 : 6}
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
                      {dueDate.getDate()} of each month
                    </Text>
                    <Ionicons name="calendar" size={isWeb ? 24 : 20} color={isDark ? "#fff" : "#000"} />
                  </XStack>
                </TouchableOpacity>
                
                {showDatePicker && (
                  isWeb ? (
                    <WebDatePicker />
                  ) : (
                    <View style={{ marginTop: 10 }}>
                      <DateTimePicker
                        value={dueDate}
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                      />
                    </View>
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