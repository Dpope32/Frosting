import { YStack, Text, Button, Circle, Label } from 'tamagui'
import { Image } from 'react-native'
import { FormData } from '@/types'
import { useUserStore } from '@/store/UserStore'

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

  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <YStack gap="$1" alignItems="center">
        <Label fontFamily="$body" size="$8" textAlign="center" color="$gray12Dark">
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
              onError={(e) => console.error('Image loading error:', e.nativeEvent.error)}
            />
          ) : (
            <YStack alignItems="center" gap="$2">
              <Circle size={60} backgroundColor="$gray6Dark">
                <Text fontFamily="$body" fontSize={24}>👤</Text>
              </Circle>
              <Text fontFamily="$body" color="$gray9Dark" fontSize="$3">
                Pick Photo
              </Text>
            </YStack>
          )}
        </Circle>
        <Text
          fontFamily="$body"
          fontSize="$3"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          fontWeight="400"
          paddingTop={10}
        >
          All data is stored locally.
        </Text>
        <Button
          chromeless
          onPress={async () => {
            // Get a random image from Lorem Picsum
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
          color="$blue10Dark"
          marginTop="$1"
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}
