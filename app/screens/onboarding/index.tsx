import { useState, useEffect } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native'
import { XStack, Button, Text, View } from 'tamagui'
import * as ImagePicker from 'expo-image-picker'
import { router } from 'expo-router'

import { useUserStore } from '@/store/UserStore'
import { colorOptions } from '@/constants/Colors'
import { backgroundStyles, getWallpaperPath } from '@/constants/Backgrounds'
import { FormData } from '@/types'

import Step0 from './step0'
import Step1 from './step1'
import Step2 from './step2'
import Step3 from './step3'
import Step4 from './step4'
import Step5 from './step5'

export default function Onboarding() {
  const [step, setStep] = useState(0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)

  const [formData, setFormData] = useState<FormData>({
    username: '',
    profilePicture: '',
    primaryColor: '$gray5',
    backgroundStyle: 'gradient',
    zipCode: '',
  })

  const setPreferences = useUserStore((state) => state.setPreferences)

  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener('keyboardWillShow', () => {
      setKeyboardVisible(true)
    })
    const keyboardWillHide = Keyboard.addListener('keyboardWillHide', () => {
      setKeyboardVisible(false)
    })
    return () => {
      keyboardWillShow.remove()
      keyboardWillHide.remove()
    }
  }, [])

  const handleNext = () => {
    if (step === 5) {
      setPreferences({ ...formData, hasCompletedOnboarding: true })
      router.replace('/(drawer)/(tabs)' as const)
    } else {
      setStep((prev) => prev + 1)
    }
  }

  const handleBack = () => {
    setStep((prev) => prev - 1)
  }

  const canProceed = () => {
    switch (step) {
      case 0:
        return formData.username.length >= 2
      case 4:
        return formData.zipCode.length === 5
      case 5:
        // Can proceed if a team is selected or we'll default to OKC
        return true
      default:
        return true
    }
  }

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: 'images',
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    })
    if (!result.canceled) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: result.assets[0].uri,
      }))
    }
  }

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <Step0
            formData={formData}
            setFormData={setFormData}
          />
        )
      case 1:
        return (
          <Step1
            formData={formData}
            setFormData={setFormData}
            pickImage={pickImage}
            handleNext={handleNext}
          />
        )
      case 2:
        return (
          <Step2
            formData={formData}
            setFormData={setFormData}
            colorOptions={[...colorOptions]}
          />
        )
      case 3:
        return (
          <Step3
            formData={formData}
            setFormData={setFormData}
            backgroundStyles={[...backgroundStyles]}
            getWallpaperPath={getWallpaperPath}
          />
        )
      case 4:
        return (
          <Step4
            formData={formData}
            setFormData={setFormData}
            handleNext={handleNext}
          />
        )
      case 5:
        return (
          <Step5
            formData={formData}
            setFormData={setFormData}
            handleNext={handleNext}
          />
        )
      default:
        return null
    }
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View flex={1} backgroundColor="$gray1Dark">
        {Platform.OS === 'ios' || Platform.OS === 'android' ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View flex={1}>
              {renderStep()}
              <View
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                padding="$4"
                paddingBottom={Platform.OS === 'ios' ? (keyboardVisible ? 16 : 40) : 24}
                backgroundColor="$gray1Dark"
                style={{ borderTopWidth: keyboardVisible ? 0 : 1, borderTopColor: 'rgba(255,255,255,0.1)'}}>
              <XStack gap="$3" justifyContent={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 'center' : 'space-between'}>
                {step > 0 && (
                  <Button
                    flex={Platform.OS !== 'ios' && Platform.OS !== 'android' ? undefined : 1}
                    width={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 145 : undefined}
                    variant="outlined"
                    onPress={handleBack}
                    backgroundColor="$gray4Dark"
                    borderColor="$gray8Dark">
                    <Text fontFamily="$body" color="$gray12Dark">Back</Text>
                  </Button>
                )}
                <Button
                  flex={Platform.OS !== 'ios' && Platform.OS !== 'android' ? undefined : 2}
                  width={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 300 : undefined}
                  backgroundColor={formData.primaryColor}
                  borderColor="$gray8Dark"
                  borderWidth={1}
                  opacity={!canProceed() ? 0.5 : 1}
                  disabled={!canProceed()}
                  onPress={handleNext}>
                  <Text fontFamily="$body" color="white" fontWeight="bold">
                    {step === 5 ? 'Complete' : 'Continue'}
                  </Text>
                </Button>
              </XStack>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View flex={1}>
            {renderStep()}
            <View
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              padding="$4"
              paddingBottom={24}
              backgroundColor="$gray1Dark"
              style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)'}}>
              <XStack gap="$3" justifyContent="center">
                {step > 0 && (
                  <Button
                    width={145}
                    variant="outlined"
                    onPress={handleBack}
                    backgroundColor="$gray4Dark"
                    borderColor="$gray8Dark">
                    <Text fontFamily="$body" color="$gray12Dark">Back</Text>
                  </Button>
                )}
                <Button
                  width={300}
                  backgroundColor={formData.primaryColor}
                  borderColor="$gray8Dark"
                  borderWidth={1}
                  opacity={!canProceed() ? 0.5 : 1}
                  disabled={!canProceed()}
                  onPress={handleNext}>
                  <Text fontFamily="$body" color="white" fontWeight="bold">
                    {step === 5 ? 'Complete' : 'Continue'}
                  </Text>
                </Button>
              </XStack>
            </View>
          </View>
        )}
      </View>
    </KeyboardAvoidingView>
  )
}
