import React, { useState, useEffect } from 'react'
import { Keyboard, KeyboardAvoidingView, Platform, TouchableWithoutFeedback } from 'react-native'
import { XStack, Button, Text, View, isWeb } from 'tamagui'
import { useImagePicker } from '@/hooks/useImagePicker'
import { router } from 'expo-router'
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore'
import { colorOptions } from '@/constants/Colors' 
import { backgroundStyles, getWallpaperPath } from '@/constants/Backgrounds'
import { FormData } from '@/types'
import { preloadWallpapers } from '../../../components/wpPreload'
import { requestPermissionsWithDelay, markPermissionsAsExplained } from '@/services/permissionService'
import { setupPermissionsAndNotifications } from '@/hooks/useAppInitialization'
import { useToastStore } from '@/store/ToastStore'
import WelcomeScreen from './welcome' 
import PermissionsScreen from './permissions'
import Step0 from './step0'
import Step1 from './step1'
import Step2 from './step2'
import Step3 from './step3'
import Step4 from './step4'
import Step5 from './step5'

export default function Onboarding() {
  const [step, setStep] = useState<number>(isWeb ? -2 : 0)
  const [keyboardVisible, setKeyboardVisible] = useState(false)
  const colorScheme = useColorScheme(); 
  const { showToast } = useToastStore();
  const isDark = colorScheme === 'dark';
  const [formData, setFormData] = useState<FormData>({
    username: '',
    profilePicture: '',
    primaryColor: isDark ? '$gray5' : '$blue9',  
    backgroundStyle: 'gradient',
    zipCode: '',
  })
  const [wallpapersPreloaded, setWallpapersPreloaded] = useState(false);
  const setPreferences = useUserStore((state) => state.setPreferences)

  // Check if device is a mobile browser
  const isMobileBrowser = isWeb && typeof window !== 'undefined' && 
    (window.innerWidth <= 768 || /Mobi|Android/i.test(navigator.userAgent));

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

  useEffect(() => {
    if (step >= 0 && !wallpapersPreloaded) {
      preloadWallpapers(() => {
        setWallpapersPreloaded(true);
      });
    }
  }, [step, wallpapersPreloaded]);

  const handleNext = async () => {
    try {
      if (step === -2) { 
        setStep(isWeb ? 0 : -1); // Skip permissions screen on web
      } else if (step === -1) { 
        setStep(0);
        await markPermissionsAsExplained();
      } else if (step === 0) { 
        if (formData.username.length < 2) {
          showToast('Username must be at least 2 characters long.')
          return
        }
        
        if (Platform.OS !== 'web') {
          try {
            const permissions = await requestPermissionsWithDelay(1000);
            await setupPermissionsAndNotifications(permissions);
          } catch (error) {
            console.error("Error setting up permissions:", error);
            // Continue anyway to not block users
          }
        }
        
        setStep(1);
      } else if (step === 5) {
        setPreferences({ ...formData, hasCompletedOnboarding: true })
        setTimeout(() => {
          router.replace('/(drawer)/(tabs)')
        }, 100)
      } else {
        setStep((prev) => prev + 1)
      }
    } catch (error) {
      console.error("Navigation error:", error);
      showToast('Something went wrong. Please try again.');
    }
  }

  const handleBack = () => {
    if (isWeb && step === 0) {
      setStep(-2); // Skip permissions screen on web
    } else {
      setStep((prev) => prev - 1)
    }
  }

  const canProceed = () => {
    switch (step) {
      case -2:
      case -1: 
        return true
      case 0:
        return formData.username.length >= 2
      case 4:
        return formData.zipCode.length === 5
      case 5:
        return true
      default:
        return true
    }
  }

  const { pickImage: pickImageFromLibrary, isLoading: isPickingImage } = useImagePicker();

  const pickImage = async () => {
    const imageUri = await pickImageFromLibrary();
    if (imageUri) {
      setFormData((prev) => ({
        ...prev,
        profilePicture: imageUri,
      }));
    }
  }

  const renderStep = () => {
    switch (step) {
      case -2:
        return (
          <WelcomeScreen onComplete={handleNext} />
        )
      case -1: 
        return (
          <PermissionsScreen isDark={isDark}/> 
        )
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

  const getButtonColor = () => {
    if (step < 2 && !isDark) {
      return '$blue9';
    }
    return formData.primaryColor || '$onboardingButtonPrimary'; 
  }
  
  const getButtonTextColor = () => {
    return 'white'; 
  }

  const getBottomPadding = () => {
    if (Platform.OS === 'ios') {
      return keyboardVisible ? 16 : 40;
    }
    return 24;
  }

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
    >
      <View flex={1} backgroundColor="$onboardingIndexBackground"> 
        {Platform.OS === 'ios' || Platform.OS === 'android' ? (
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View flex={1}>
              <View flex={1} style={{ paddingBottom: isWeb ? 80 : 0 }}> 
                {renderStep()}
              </View>
              <View
                position="absolute"
                bottom={0}
                left={0}
                right={0}
                padding="$4"
                paddingBottom={getBottomPadding()}
                backgroundColor="$onboardingIndexBackground" 
                style={{ 
                  borderTopWidth: keyboardVisible ? 0 : 1, 
                  borderTopColor: '$onboardingIndexBorder',
                  zIndex: 10 
                }}> 
                <XStack gap="$3" justifyContent={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 'center' : 'space-between'}>
                  {step > 0 && (
                    <Button
                      flex={Platform.OS !== 'ios' && Platform.OS !== 'android' ? undefined : 1}
                      width={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 145 : undefined}
                      variant="outlined"
                      onPress={handleBack}
                      backgroundColor="$onboardingIndexButtonBackground" 
                      borderColor="$onboardingIndexButtonBorder"> 
                      <Text fontFamily="$body" color="$onboardingIndexButtonText">Back</Text> 
                    </Button>
                  )}
                  <Button
                    flex={Platform.OS !== 'ios' && Platform.OS !== 'android' ? undefined : 2}
                    width={Platform.OS !== 'ios' && Platform.OS !== 'android' ? 300 : undefined}
                    backgroundColor={getButtonColor()} 
                    borderColor="$onboardingIndexButtonBorder" 
                    borderWidth={1}
                    opacity={!canProceed() ? 0.5 : 1}
                    disabled={!canProceed()}
                    onPress={handleNext}>
                    <Text fontFamily="$body" color={getButtonTextColor()} fontWeight="bold">
                      {step === 5 ? 'Complete' : 'Continue'}
                    </Text>
                  </Button>
                </XStack>
              </View>
            </View>
          </TouchableWithoutFeedback>
        ) : (
          <View flex={1}>
            <View flex={1} style={{ paddingBottom: isMobileBrowser ? 80 : 0 }}> {/* Add padding only for mobile browsers */}
              {renderStep()}
            </View>
            <View
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              padding="$4"
              paddingBottom={24}
              backgroundColor="$onboardingIndexBackground" 
              style={{ 
                borderTopWidth: 1, 
                borderTopColor: '$onboardingIndexBorder',
                zIndex: 10 
              }}> 
              <XStack gap="$3" justifyContent="center">
                {(step > -1) && (
                  <Button
                    width={isMobileBrowser ? 120 : 145}
                    variant="outlined"
                    onPress={handleBack}
                    backgroundColor="$onboardingIndexButtonBackground" 
                    borderColor="$onboardingIndexButtonBorder"> 
                    <Text fontFamily="$body" color="$onboardingIndexButtonText">Back</Text> 
                  </Button>
                )}
                <Button
                  width={isMobileBrowser ? 200 : 300}
                  backgroundColor={getButtonColor()} 
                  borderColor="$onboardingIndexButtonBorder" 
                  borderWidth={1}
                  opacity={!canProceed() ? 0.5 : 1}
                  disabled={!canProceed()}
                  onPress={handleNext}>
                  <Text fontFamily="$body" color={getButtonTextColor()} fontWeight="bold">
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
