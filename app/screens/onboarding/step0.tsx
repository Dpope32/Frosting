import { YStack, Input, Label } from 'tamagui'
import { Platform } from 'react-native'
import { FormData } from '@/types'

export default function Step0({
  formData,
  setFormData,
  isDark = true, // Default to dark if not provided
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  isDark?: boolean
}) {
  // Dynamic theme styles
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const inputBackgroundColor = isDark ? "$gray4Dark" : "$gray4Light";
  const inputBorderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const inputTextColor = isDark ? "$gray12Dark" : "$gray12Light";
  const placeholderColor = isDark ? "$gray9Dark" : "$gray9Light";

  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <Label fontFamily="$body" size="$8" textAlign="center" color={labelColor}>
        What should we call you?
      </Label>
      <Input
        size="$4"
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, username: text }))
        }
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="sentences"
        backgroundColor={inputBackgroundColor}
        borderColor={inputBorderColor}
        color={inputTextColor}
        placeholderTextColor={placeholderColor}
        fontFamily="$body"
        textAlign="center"
        style={{ 
          textAlign: 'center',
          alignSelf: 'center',
          width: '100%',
          maxWidth: 300
        }}
      />
    </YStack>
  )
}