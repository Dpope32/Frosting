import React from 'react'
import { YStack, Input, Label, isWeb } from 'tamagui'
import { Platform } from 'react-native'
import { FormData } from '@/types/onboarding'

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$6" : "$3"} justifyContent="center" alignItems="center">
      <Label paddingBottom={20} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : "$7"} textAlign="center" color="$onboardingLabel">
        What should we call you?
      </Label>
      <Input
        size={isWeb ? "$4" : "$4"}
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>setFormData((prev) => ({ ...prev, username: text }))}
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="sentences"
        backgroundColor="$onboardingInputBackground"
        borderColor="$onboardingInputBorder"
        color="$onboardingInputText"
        placeholderTextColor="$onboardingPlaceholder"
        fontFamily="$body"
        textAlign="center"
        style={{  textAlign: 'center', alignSelf: 'center', width: '100%', maxWidth: 300}}
      />
    </YStack>
  )
}
