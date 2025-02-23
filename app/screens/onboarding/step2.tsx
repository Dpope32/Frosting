import { YStack, Text, XStack, Circle, Label } from 'tamagui'
import { FormData, ColorOption } from '@/types'
import { View, useColorScheme } from 'react-native'
import ColorPicker from 'react-native-wheel-color-picker'

export default function Step2({
  formData,
  setFormData,
  colorOptions,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  colorOptions: ColorOption[]
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const textColor = isDark ? '#fff' : '#000'

  // Use current color or default to first color option
  const currentColor = formData.primaryColor || (colorOptions.length > 0 ? colorOptions[0].value : '#000000')

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, primaryColor: color }))
  }

  return (
    <YStack gap="$1" flex={1} justifyContent="center" padding="$5" paddingTop="$15">
      <Label size="$8" textAlign="center" color="$gray12Dark">
        Pick your primary color
      </Label>
      <Text
        fontSize="$3"
        textAlign="center"
        color="$gray9Dark"
        opacity={0.8}
        fontWeight="400"
      >
        (yes you can change this later)
      </Text>

      {/* Color Picker */}
      <YStack flex={1} paddingVertical="$4">
        <View style={{ flex: 1, padding: 20 }}>
          <ColorPicker
            color={currentColor}
            onColorChange={handleColorChange}
            thumbSize={30}
            sliderSize={30}
            noSnap={true}
            row={false}
          />
        </View>
      </YStack>

      <XStack gap="$2" alignItems="center" justifyContent="center">
        <Circle size={50} backgroundColor={currentColor} />
        <Text fontSize={16} color={textColor}>
          {currentColor.toUpperCase()}
        </Text>
      </XStack>
    </YStack>
  )
}
