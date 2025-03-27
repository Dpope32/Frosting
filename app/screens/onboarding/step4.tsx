import React from 'react'
import { YStack, Input, Label, Text, Button } from 'tamagui'
import { FormData } from '@/types'
import { Alert, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import { validateZipCode, FALLBACK_ZIP_CODES } from '@/utils/zipCodeValidator'

export default function Step4({
  formData,
  setFormData,
  handleNext,
  isDark = true, 
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
  isDark?: boolean
}) {
  const isWeb = Platform.OS === 'web';
  const [zipError, setZipError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const subTextColor = isDark ? "$gray9Dark" : "$gray9Light";
  const inputBackgroundColor = isDark ? "$gray2Dark" : "$gray2Light";
  const inputBorderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const inputTextColor = isDark ? "$gray12Dark" : "$gray12Light";
  const placeholderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const buttonColor = isDark ? "$blue10Dark" : "$blue10Light";
  const errorColor = "$red9";

  useEffect(() => {
    if (!formData.zipCode) {
      setZipError(null);
      return;
    }
    if (formData.zipCode.length < 3) {
      setZipError(null);
      return;
    }
    if (formData.zipCode.length === 5) {
      const validation = validateZipCode(formData.zipCode);
      setZipError(validation.isValid ? null : validation.message || null);
    }
  }, [formData.zipCode]);


  return (
    <YStack flex={1} justifyContent="center" alignItems="center">

      <YStack alignItems="center" gap="$1" marginBottom={isWeb ? "$6" : "$2"}>
        <Label
          fontFamily="$heading"
          size={isWeb ? "$9" : "$8"}
          fontWeight="500" 
          textAlign="center"
          color={labelColor}
        >
          What's your zip?
        </Label>
        <Text
          fontFamily="$body"
          fontSize="$3"
          textAlign="center"
          color={subTextColor}
          mt={-12}
          opacity={0.8}
          fontWeight="400"
          fontStyle="italic"
        >
          For local weather information
        </Text>
      </YStack>

      <YStack alignItems="center" width="80%" padding={isWeb ? "$4" : "$2"}>
        <Input
          size="$4"
          placeholder="Enter zip code"
          fontFamily="$body"
          value={formData.zipCode}
          onChangeText={(text) => {
            const numericText = text.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, zipCode: numericText }));
            setIsValidating(true);
          }}
          keyboardType="numeric"
          maxLength={5}
          autoFocus
          backgroundColor={inputBackgroundColor}
          borderColor={zipError ? errorColor : inputBorderColor}
          color={inputTextColor}
          placeholderTextColor={placeholderColor}
          textAlign="center"
          letterSpacing={1}
          borderWidth={1.25}
          fontSize={16}
          shadowColor={inputBorderColor}
          shadowRadius={20}
          shadowOpacity={0.2}
          focusStyle={{
            borderColor: zipError ? errorColor : inputBorderColor,
            scale: 1.02,
          }}
          width={isWeb ? 300 : "90%"}
          maxWidth={500}
        />
        
        {zipError && (
          <Text
            color={errorColor}
            fontSize={14}
            mt={8}
            textAlign="center"
          >
            {zipError}
          </Text>
        )}
      </YStack>
      
      <YStack alignItems="center" mt={isWeb ? "$2" : "$1"} gap="$2">
        
        <Button
          chromeless
          onPress={() => {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              Alert.alert(
                "Skip Zip Code?",
                "Weather data won't be accurate for your location. Continue anyway?",
                [
                  {
                    text: "No",
                    style: "cancel"
                  },
                  {
                    text: "Yes",
                    onPress: () => {
                      setFormData(prev => ({ ...prev, zipCode: FALLBACK_ZIP_CODES.DEFAULT }))
                      handleNext()
                    }
                  }
                ]
              )
            } else {
              if (window.confirm("Weather data won't be accurate for your location. Continue anyway?")) {
                setFormData(prev => ({ ...prev, zipCode: FALLBACK_ZIP_CODES.DEFAULT }))
                handleNext()
              }
            }
          }}
          color={buttonColor}
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}