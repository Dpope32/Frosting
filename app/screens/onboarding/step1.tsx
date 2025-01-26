import { YStack, Text, Button, Circle, Label } from 'tamagui'
import { Image } from 'react-native'
import { FormData } from '@/types'

export default function Step1({
  formData,
  setFormData,
  pickImage,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  pickImage: () => void
}) {
  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <YStack gap="$1" alignItems="center">
        <Label size="$8" textAlign="center" color="$gray12Dark">
          Profile Picture
        </Label>
        <Circle
          size={180}
          borderWidth={2}
          borderColor="$gray8Dark"
          borderStyle="dashed"
          backgroundColor="$gray4Dark"
          onPress={pickImage}
          pressStyle={{
            scale: 0.98,
            backgroundColor: '$gray5Dark',
          }}
        >
          {formData.profilePicture ? (
            <Image
              source={{ uri: formData.profilePicture }}
              style={{ width: 180, height: 180, borderRadius: 90 }}
            />
          ) : (
            <YStack alignItems="center" gap="$2">
              <Circle size={60} backgroundColor="$gray6Dark">
                <Text fontSize={24}>👤</Text>
              </Circle>
              <Text color="$gray9Dark" fontSize="$3">
                Pick Photo
              </Text>
            </YStack>
          )}
        </Circle>
        <Text
          fontSize="$3"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          fontWeight="400"
          paddingTop="$4"
        >
          Tap the circle to choose a photo.
        </Text>
        <Text
          fontSize="$3"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          fontWeight="400"
        >
          All data is stored locally.
        </Text>
        <Button
          chromeless
          onPress={() => {
            // skipping = just go forward
            setFormData((prev) => ({
              ...prev,
              profilePicture: prev.profilePicture || '', 
            }))
          }}
          color="$blue10Dark"
          marginTop="$1"
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}
