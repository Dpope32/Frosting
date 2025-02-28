import { YStack, Input, Label } from 'tamagui'
import { Platform } from 'react-native'
import { FormData } from '@/types'

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <Label fontFamily="$body" size="$8" textAlign="center" color="$gray12Dark">
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
        backgroundColor="$gray4Dark"
        borderColor="$gray8Dark"
        color="$gray12Dark"
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
