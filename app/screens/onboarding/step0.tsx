import React, { useRef, useEffect, useState } from 'react'
import { YStack, Input, Label, isWeb, Button, Spinner } from 'tamagui'
import { Platform, View, Text, Animated, Easing, useColorScheme } from 'react-native'
import { FormData } from '@/types'
import { isIpad } from '@/utils'
import { skipOnboardingInDev } from '@/services/dev/skipOnboarding'
import KaibaSvg from '@/components/onboarding/kaibaSvg'
import KaibaWeb from '@/components/onboarding/kaibaWeb'

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [isSkipping, setIsSkipping] = useState(false)

  const handleDevSkip = async () => {
    if (!__DEV__) return
    
    console.log('🔘 Dev skip button pressed')
    setIsSkipping(true)
    
    try {
      // Add a small delay to show the spinner
      await new Promise(resolve => setTimeout(resolve, 500))
      await skipOnboardingInDev()
      // Navigation is now handled inside skipOnboardingInDev
    } catch (error) {
      console.error('❌ Failed to skip onboarding:', error)
      setIsSkipping(false)
    }
  }

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$15" : "$12"} justifyContent="center" alignItems="center" maxWidth={500} alignSelf="center" width="100%">
      {isWeb ? (
        <KaibaWeb/>
      ) : (
        <KaibaSvg/>
      )}
      <Label paddingBottom={isWeb ? 20 : isIpad() ? 12 : 2} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : 20} textAlign="center" color="$onboardingLabel">
        What should we call you?
      </Label>
      <Input
        size={isWeb ? "$7" : isIpad() ? "$6" : "$5"}
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>setFormData((prev) => ({ ...prev, username: text }))}
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="words"
        backgroundColor="transparent"
        borderColor={isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)"}
        autoComplete="off"
        borderWidth={2}
        borderRadius={12}
        autoCorrect={false}
        color={isDark ? "#ffffff" : "#000000"}
        fontWeight="700"
        placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"}
        fontFamily="$body"
        textAlign="center"
        focusStyle={{
          borderColor: isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)",
        }}
        style={{  textAlign: 'center', alignSelf: 'center',  maxWidth: isWeb ? 350 : isIpad() ? 300 : 250, width: isWeb ? 300 : isIpad() ? 250 : 220, height: isWeb ? 55 : isIpad() ? 50 : 43}}
      />
      
      {__DEV__ && (
        <Button
          onPress={handleDevSkip}
          disabled={isSkipping}
          size="$3"
          variant="outlined"
          borderColor="$orange8"
          backgroundColor="transparent"
          color="$orange9"
          marginTop="$4"
          fontFamily="$body"
          fontSize="$3"
          fontWeight="600"
          alignSelf="center"
          opacity={0.7}
        >
          {isSkipping ? (
            <>
              <Spinner size="small" color="$orange9" />
            </>
          ) : (
            'skip →'
          )}
        </Button>
      )}
    </YStack>
  )
}