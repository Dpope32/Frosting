import React from 'react'
import { YStack, Input, Label, isWeb } from 'tamagui'
import { Platform, View, Text } from 'react-native'
import { FormData } from '@/types/onboarding'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$6" : "$10"} justifyContent="center" alignItems="center">
      <MaskedView
        style={{ height: 150, width: '100%'}}
        maskElement={
          <View
            style={{
              backgroundColor: 'transparent',
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Text
              style={{
                fontSize: isWeb ? 120 : 90,
                textAlign: 'center',
                alignSelf: 'center',
                width: '100%',
                color: 'black',
                fontWeight: 'bold',
                fontFamily: '$heading',
                letterSpacing: 2,
              }}
            >
              Kaiba
            </Text>
          </View>
        }
      >
        <LinearGradient
          colors={['#89CFF0', '#C0C0C0', '#89CFF0', '#C0C0C0', '#89CFF0']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          locations={[0, 0.25, 0.5, 0.75, 1]}
          style={{ flex: 1 }}
        />
      </MaskedView>
      <Label paddingBottom={12} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : "$7"} textAlign="center" color="$onboardingLabel">
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
