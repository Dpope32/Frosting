import React from 'react'
import { YStack, Input, Label, isWeb } from 'tamagui'
import { Platform, View, Text } from 'react-native'
import { FormData } from '@/types/onboarding'
import MaskedView from '@react-native-masked-view/masked-view'
import { LinearGradient } from 'expo-linear-gradient'
import { isIpad } from '@/utils/deviceUtils'

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$6" : "$10"} justifyContent="center" alignItems="center" maxWidth={500} alignSelf="center" width="100%">
      <MaskedView
        style={{ height: isWeb ? 200 : isIpad() ? 150 : 90, width: '100%'}}
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
                fontSize: isWeb ? 120 : isIpad() ? 100 : 60,
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
          colors={['#89CFF0', '#C0C0C0', '#89CFF0', '#C0C0C0', '#89CFF0', '#C0C0C0', '#89CFF0', '#C0C0C0', '#89CFF0', '#C0C0C0', '#89CFF0']}
          start={{ x: 1, y: 0 }}
          end={{ x: 0, y: 1 }}
          locations={[0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]}
          style={{ flex: 1 }}
        />
      </MaskedView>
      <Label paddingBottom={isWeb ? 14 : isIpad() ? 12 : 8} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : 20} textAlign="center" color="$onboardingLabel">
        What should we call you?
      </Label>
      <Input
        size={isWeb ? "$7" : isIpad() ? "$6" : "$5"}
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>setFormData((prev) => ({ ...prev, username: text }))}
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="words"
        backgroundColor="$onboardingInputBackground"
        borderColor="$onboardingInputBorder"
        autoComplete="off"
        autoCorrect={false}
        color="$onboardingInputText"
        fontWeight="700"
        placeholderTextColor="$onboardingPlaceholder"
        fontFamily="$body"
        textAlign="center"
        style={{  textAlign: 'center', alignSelf: 'center', width: '100%', maxWidth: isWeb ? 350 : isIpad() ? 300 : 250}}
      />
    </YStack>
  )
}
