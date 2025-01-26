import { YStack, Text, XStack, Circle, Label } from 'tamagui'
import { FormData, ColorOption } from '@/types'

export default function Step2({
  formData,
  setFormData,
  colorOptions,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  colorOptions: ColorOption[]
}) {
  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4">
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
      <XStack gap="$4" paddingVertical="$4" flexWrap="wrap" justifyContent="center">
        {colorOptions.map((color) => (
          <Circle
            key={color.label}
            size={60}
            backgroundColor={color.value}
            borderWidth={formData.primaryColor === color.value ? 2 : 0}
            borderColor="white"
            onPress={() => setFormData((prev) => ({ ...prev, primaryColor: color.value }))}>
            {formData.primaryColor === color.value && (
                <Text color="white">✓</Text>
            )}
          </Circle>
        ))}
      </XStack>
    </YStack>
  )
}
