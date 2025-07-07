import React from 'react'
import { YStack, Text, Button, Circle, isWeb } from 'tamagui'
import { Image } from 'react-native'
import { FormData } from '@/types'
import { useUserStore } from '@/store'
import { isIpad } from '@/utils'

export default function Step1({
  formData,
  setFormData,
  pickImage,
  handleNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  pickImage: () => void
  handleNext: () => void
}) {

  const defaultIcon = { icon: '👤', label: 'Default User' };

  return (
    <YStack marginTop={0} gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <Text 
        color="$onboardingLabel" 
        fontFamily="$heading" 
        fontWeight="700" 
        fontSize={isWeb ? "$8" : "$7"}
        textAlign="center"
      >
        {formData.profilePicture ? "Final answer?" : `Welcome, ${formData.username}!`}
      </Text>
      <YStack gap="$2" alignItems="center">
        <Circle
          size={180}
          borderWidth={2}
          borderColor="$onboardingInputBorder"
          borderStyle="dashed"
          backgroundColor="$onboardingStep1Background"
          onPress={pickImage}
          pressStyle={{
            scale: 0.98,
            backgroundColor: '$onboardingStep1HoverBackground',
          }}
          {...(isWeb && {
            style: {
              cursor: 'pointer'
            }
          })}
        >
          {formData.profilePicture ? (
            <Image
              source={{ uri: formData.profilePicture }}
              style={{ width: 180, height: 180, borderRadius: 90 }}
              onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <YStack alignItems="center" gap="$2">
              <Circle size={60} backgroundColor="$onboardingStep1CircleBackground">
                <Text fontFamily="$body" fontSize={24}>{defaultIcon.icon}</Text>
              </Circle>
              <Text color="$onboardingSubText" fontFamily="$heading" fontWeight="700">
                Profile Picture
              </Text>
            </YStack>
          )}
        </Circle>
        <Button
          chromeless
          onPress={async () => {
            const wallpaperUri = 'https://picsum.photos/200';
            setFormData((prev) => ({
              ...prev,
              profilePicture: wallpaperUri
            }));
            useUserStore.getState().setPreferences({
              profilePicture: wallpaperUri
            });
            handleNext();
          }}
          color="$onboardingButtonPrimary"
          mt="$1"
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}
