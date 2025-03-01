import { YStack, Input, Label, Text, Button } from 'tamagui'
import { FormData } from '@/types'
import { Alert, Platform } from 'react-native'

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
          onChangeText={(text) => setFormData((prev) => ({ ...prev, zipCode: text }))}
          keyboardType="numeric"
          maxLength={5}
          autoFocus
          backgroundColor="$gray2Dark"
          borderColor="$gray8Dark"
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
            borderColor: '$gray8Dark',
            scale: 1.02,
          }}
          // Constrain width on web
          width={isWeb ? 300 : "90%"}
          maxWidth={500}
        />
      </YStack>
      
      <YStack alignItems="center" marginTop={isWeb ? "$2" : "$1"}>
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
                      setFormData(prev => ({ ...prev, zipCode: "75201" }))
                      handleNext()
                    }
                  }
                ]
              )
            } else {
              // Use browser confirm on web
              if (window.confirm("Weather data won't be accurate for your location. Continue anyway?")) {
                // Set Dallas, TX zip code as default
                setFormData(prev => ({ ...prev, zipCode: "75201" }))
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
