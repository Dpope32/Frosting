import React, { useState } from 'react'
import { Button, Input, Text, YStack, XStack, Slider, View } from 'tamagui'
import { useUserStore } from '@/store/UserStore'
import { BaseCardModal } from './BaseCardModal'
import Animated, { FadeInDown, FadeIn, SlideInUp } from 'react-native-reanimated'
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
  const [showDatePicker, setShowDatePicker] = useState(false)
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
    const currentDate = selectedDate || dueDate
    setShowDatePicker(Platform.OS === 'ios')
    setDueDate(currentDate)
  }

  const handleAmountChange = (value: number[]) => {
    const newAmount = value[0]
    setSliderValue(newAmount)
    setAmount(parseFloat(newAmount.toFixed(2)))
  }

  // Format amount to have 2 decimal places
  const formattedAmount = amount.toFixed(2)

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
        <YStack gap="$4" paddingBottom="$4">
          <Animated.View entering={FadeInDown.delay(100).duration(500)}>
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
            />
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(200).duration(500)}>
            <YStack gap="$5">
              <Text fontFamily="$body" color="$color">${formattedAmount}</Text>
              <XStack alignItems="center" gap="$2">
                <Text fontFamily="$body" color="$color">$</Text>
                <Input
                  placeholder="Custom Amount"
                  value={formattedAmount}
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
                  width="50%"
                />
              </XStack>
              <XStack alignItems="center" gap="$2" width="100%">
                <Text fontFamily="$body" color="$color" fontSize="$2">$0</Text>
                <Slider
                  value={[sliderValue]}
                  onValueChange={handleAmountChange}
                  step={5}
                  flex={1}
                  maxWidth="80%"
                  minWidth={0}
                  max={MAX_AMOUNT}
                >
                  <Slider.Track backgroundColor={isDark ? "$gray5" : "$gray3"} height={4} borderRadius={3}>
                    <Slider.TrackActive backgroundColor={primaryColor} />
                  </Slider.Track>
                  <Slider.Thumb 
                    index={0} 
                    width={8} 
                    height={8} 
                    backgroundColor={primaryColor}
                    borderRadius={8}
                    shadowColor="black"
                    shadowOffset={{ width: 0, height: 2 }}
                    shadowOpacity={0.2}
                    shadowRadius={2}
                    elevation={2}
                  />
                </Slider>
                <Text fontFamily="$body" color="$color" fontSize="$2">${MAX_AMOUNT}</Text>
              </XStack>
            </YStack>
          </Animated.View>
          
          <Animated.View entering={FadeInDown.delay(300).duration(500)}>
            <YStack gap="$s">
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <XStack
                  backgroundColor="$backgroundHover"
                  borderColor="$borderColor"
                  borderWidth={1}
                  borderRadius={8}
                  padding="$3"
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Text fontFamily="$body" color="$color">
                    {dueDate.getDate()} of each month
                  </Text>
                  <Ionicons name="calendar" size={20} color={isDark ? "#fff" : "#000"} />
                </XStack>
              </TouchableOpacity>
              
              {/* Date Picker */}
              {showDatePicker && (
                <DateTimePicker
                  value={dueDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={onDateChange}
                  // We only care about the day, not the month or year
                  // The picker will still show the full date
                />
              )}
            </YStack>
          </Animated.View>
          
          <Animated.View entering={SlideInUp.delay(500).duration(400)}>
            <XStack gap="$3" jc="flex-end" marginTop="$2">
              <Button
                onPress={onClose}
                backgroundColor="$backgroundHover"
                borderColor="$borderColor"
                fontFamily="$body"
              >
                Cancel
              </Button>
              <Button
                onPress={handleSubmit}
                backgroundColor={primaryColor}
                disabled={!name || amount <= 0}
                fontFamily="$body"
              >
                Save
              </Button>
            </XStack>
          </Animated.View>
        </YStack>
      </Animated.View>
    </BaseCardModal>
  )
}