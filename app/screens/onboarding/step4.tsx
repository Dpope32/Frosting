import { YStack, Input, Label, Text, Button } from 'tamagui'
import { FormData } from '@/types'
import { Alert } from 'react-native'

export default function Step4({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  return (
    <YStack gap="$6" flex={1} justifyContent="center" padding="$8">
      <YStack gap="$2">
        <Label
          size="$9"
          textAlign="center"
          color="$gray12Dark"
          letterSpacing={-1}
          fontWeight="700"
        >
          What's your zip?
        </Label>
        <Text
          fontSize="$4"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          marginTop={-20}
          fontWeight="400"
          fontStyle="italic"
        >
          For local weather information
        </Text>
      </YStack>

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
      />
      
      <Button
        chromeless
        onPress={() => {
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
                }
              }
            ]
          )
        }}
        color="$blue10Dark"
      >
        Skip for now
      </Button>
    </YStack>
  )
}
