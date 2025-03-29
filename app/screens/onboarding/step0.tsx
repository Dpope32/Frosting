import React from 'react'
import { YStack, Input, Label, isWeb } from 'tamagui'
import { Platform } from 'react-native'
import { FormData } from '@/types'

export default function Step0({
  formData,
  setFormData,
  isDark = true, 
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  isDark?: boolean
}) {
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const inputBackgroundColor = isDark ? "$gray4Dark" : "$gray4Light";
  const inputBorderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const inputTextColor = isDark ? "$gray12Dark" : "$gray12Light";
  const placeholderColor = isDark ? "$gray9Dark" : "$gray9Light";

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$6" : "$3"} justifyContent="center" alignItems="center">
      <Label paddingBottom={20} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : "$7"} textAlign="center" color={labelColor}>
        What should we call you?
      </Label>
      <Input
        size="$4"
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>setFormData((prev) => ({ ...prev, username: text }))}
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="sentences"
        bc={inputBackgroundColor}
        borderColor={inputBorderColor}
        color={inputTextColor}
        placeholderTextColor={placeholderColor}
        fontFamily="$body"
        textAlign="center"
        style={{  textAlign: 'center', alignSelf: 'center', width: '100%', maxWidth: 300}}
      />
    </YStack>
  )
}