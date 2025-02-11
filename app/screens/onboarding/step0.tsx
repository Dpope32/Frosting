import { RefObject } from 'react'
import { YStack, Input, Label } from 'tamagui'
import { TextInput } from 'react-native'
import { FormData } from '@/types'

export default function Step0({
  inputRef,
  formData,
  setFormData,
}: {
  inputRef: RefObject<TextInput>
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4">
      <Label size="$8" textAlign="center" color="$gray12Dark">
        What should we call you?
      </Label>
      <Input
        ref={inputRef}
        size="$4"
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>
          setFormData((prev) => ({ ...prev, username: text }))
        }
        autoFocus
        autoCapitalize="sentences"
        backgroundColor="$gray4Dark"
        borderColor="$gray8Dark"
        color="$gray12Dark"
      />
    </YStack>
  )
}
