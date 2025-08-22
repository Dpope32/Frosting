import React from 'react'
import { YStack, Input, Label, Text, Button } from 'tamagui'
import { FormData } from '@/types'
import {  Platform, useColorScheme } from 'react-native'
import { useState, useEffect } from 'react'
import { validateZipCode, FALLBACK_ZIP_CODES, isIpad } from '@/utils'

export default function Step4({
  formData,
  setFormData,
  handleNext,
  setPreferences,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
  setPreferences: (data: any) => void
}) {
  const isWeb = Platform.OS === 'web';
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [zipError, setZipError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

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
    <YStack flex={1} backgroundColor={formData.backgroundStyle} justifyContent="center" alignItems="center" marginBottom={isWeb ? 75 : 20}>

      <YStack alignItems="center" gap="$1" marginBottom={isWeb ? "$3" : "$2"}>
        <Label
          fontFamily="$heading"
          size={isWeb ? "$9" : "$8"}
          fontWeight={isWeb ? "500" : "800"} 
          textAlign="center"
          color={isDark ? "#ffffff" : "#000000"} 
        >
          Do you want to see weather?
        </Label>
        <Text
          fontFamily="$body"
          fontSize={isWeb ? 18 : "$3"}
          textAlign="center"
          color={isDark ? "rgba(255, 255, 255, 0.7)" : "rgba(0, 0, 0, 0.6)"} 
          mt={-12}
          opacity={0.8}
          fontWeight="400"
          fontStyle="italic"
        >
          (Enter your zip code to see a 5 day forecast)
        </Text>
      </YStack>

      <YStack alignItems="center" width="80%" padding={isWeb ? "$1" : "$2"}>
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
          backgroundColor="transparent"
          borderColor={zipError ? "#DC2626" : (isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)")} 
          color={isDark ? "#ffffff" : "#000000"}
          placeholderTextColor={isDark ? "rgba(255, 255, 255, 0.6)" : "rgba(0, 0, 0, 0.5)"}
          textAlign="center"
          letterSpacing={1}
          borderWidth={1.25}
          fontSize={16}
          shadowColor={isDark ? "rgba(255, 255, 255, 0.3)" : "rgba(0, 0, 0, 0.2)"} 
          shadowRadius={20}
          shadowOpacity={0.2}
          focusStyle={{
            borderColor: zipError ? "#DC2626" : (isDark ? "rgba(255, 255, 255, 0.5)" : "rgba(0, 0, 0, 0.4)"), 
            scale: 1.02,
          }}
          width={isWeb ? 300 : isIpad() ? 300 : "70%"}
          maxWidth={500}
        />
        
        {zipError && (
          <Text
            color="#DC2626" 
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
            setFormData(prev => ({ ...prev, zipCode: FALLBACK_ZIP_CODES.DEFAULT }));
            setPreferences({ zipCode: FALLBACK_ZIP_CODES.DEFAULT, temperatureEnabled: false });
            handleNext();
          }}
          color={formData.primaryColor || "#1976D2"}
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}
