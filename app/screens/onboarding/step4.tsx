import { YStack, Input, Label, Text, Button, XStack } from 'tamagui'
import { FormData } from '@/types'
import { Alert, Platform } from 'react-native'
import { useState, useEffect } from 'react'
import { validateZipCode, FALLBACK_ZIP_CODES } from '@/utils/zipCodeValidator'

export default function Step4({
  formData,
  setFormData,
  handleNext,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  handleNext: () => void
}) {
  const isWeb = Platform.OS === 'web';
  const [zipError, setZipError] = useState<string | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  // Validate ZIP code when it changes
  useEffect(() => {
    if (!formData.zipCode) {
      setZipError(null);
      return;
    }

    // Don't show errors while typing until at least 3 digits
    if (formData.zipCode.length < 3) {
      setZipError(null);
      return;
    }

    // Show validation message when user has typed 5 digits or stopped typing
    if (formData.zipCode.length === 5) {
      const validation = validateZipCode(formData.zipCode);
      setZipError(validation.isValid ? null : validation.message || null);
    }
  }, [formData.zipCode]);

  // Handle next button press with validation
  const handleNextWithValidation = () => {
    // Validate ZIP code before proceeding
    const validation = validateZipCode(formData.zipCode);
    
    if (!validation.isValid) {
      setZipError(validation.message || 'Invalid ZIP code');
      return;
    }
    
    // If valid, proceed to next step
    handleNext();
  };

  return (
    <YStack flex={1} justifyContent="center" alignItems="center">

      <YStack alignItems="center" gap="$2" marginBottom={isWeb ? "$6" : "$3"}>
        <Label
          fontFamily="$body"
          size="$8"
          textAlign="center"
          color="$gray12Dark"
        >
          What's your zip?
        </Label>
        <Text
          fontFamily="$body"
          fontSize="$3"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          fontWeight="400"
          fontStyle="italic"
        >
          For local weather information
        </Text>
      </YStack>

      <YStack alignItems="center" width="100%" padding={isWeb ? "$4" : "$2"}>
        <Input
          size="$5"
          placeholder="Enter zip code"
          value={formData.zipCode}
          onChangeText={(text) => {
            // Only allow numeric input
            const numericText = text.replace(/[^0-9]/g, '');
            setFormData((prev) => ({ ...prev, zipCode: numericText }));
            setIsValidating(true);
          }}
          keyboardType="numeric"
          maxLength={5}
          autoFocus
          backgroundColor="$gray2Dark"
          borderColor={zipError ? "$red9" : "$gray8Dark"}
          color="$gray12Dark"
          placeholderTextColor="$gray8Dark"
          textAlign="center"
          letterSpacing={1}
          borderWidth={1.25}
          fontSize={24}
          shadowColor="$gray8Dark"
          shadowRadius={20}
          shadowOpacity={0.2}
          focusStyle={{
            borderColor: zipError ? "$red9" : '$gray8Dark',
            scale: 1.02,
          }}
          // Constrain width on web
          width={isWeb ? 300 : "90%"}
          maxWidth={500}
        />
        
        {/* Error message */}
        {zipError && (
          <Text
            color="$red9"
            fontSize={14}
            marginTop={8}
            textAlign="center"
          >
            {zipError}
          </Text>
        )}
      </YStack>
      
      <YStack alignItems="center" marginTop={isWeb ? "$2" : "$1"} gap="$2">
        
        {/* Skip button */}
        <Button
          chromeless
          onPress={() => {
            if (Platform.OS === 'ios' || Platform.OS === 'android') {
              // Use React Native Alert on native platforms
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
                      // Set Dallas, TX zip code as default
                      setFormData(prev => ({ ...prev, zipCode: FALLBACK_ZIP_CODES.DEFAULT }))
                      handleNext()
                    }
                  }
                ]
              )
            } else {
              // Use browser confirm on web
              if (window.confirm("Weather data won't be accurate for your location. Continue anyway?")) {
                // Set Dallas, TX zip code as default
                setFormData(prev => ({ ...prev, zipCode: FALLBACK_ZIP_CODES.DEFAULT }))
                handleNext()
              }
            }
          }}
          color="$blue10Dark"
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}
