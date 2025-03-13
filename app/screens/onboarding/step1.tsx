import { YStack, Text, Button, Circle, Label, isWeb } from 'tamagui'
import { Image } from 'react-native'
import { FormData } from '@/types'
import { useUserStore } from '@/store/UserStore'

export default function Step1({
  formData,
  setFormData,
  pickImage,
  handleNext,
  isDark = true, // Default to dark if not provided
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  pickImage: () => void
  handleNext: () => void
  isDark?: boolean
}) {
  // Dynamic theme styles
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const borderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const backgroundColor = isDark ? "$gray4Dark" : "$gray4Light";
  const hoverBackgroundColor = isDark ? "$gray5Dark" : "$gray5Light";
  const circleBackgroundColor = isDark ? "$gray6Dark" : "$gray6Light";
  const textColor = isDark ? "$gray9Dark" : "$gray9Light";
  const buttonColor = isDark ? "$blue10Dark" : "$blue10Light";

  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4" alignItems="center">
      <YStack gap="$2" alignItems="center">
        <Label fontFamily="$heading"   fontWeight="500" fontSize={isWeb ? "$10" : "$8"} textAlign="center" paddingBottom={16} color={labelColor}>
          Profile Picture
        </Label>
        <Circle
          size={180}
          borderWidth={2}
          borderColor={borderColor}
          borderStyle="dashed"
          backgroundColor={backgroundColor}
          onPress={pickImage}
          pressStyle={{
            scale: 0.98,
            backgroundColor: hoverBackgroundColor,
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
              <Circle size={60} backgroundColor={circleBackgroundColor}>
                <Text fontFamily="$body" fontSize={24}>👤</Text>
              </Circle>
              <Text color={textColor}  fontFamily="$heading" fontWeight="700" >
                Pick Photo
              </Text>
            </YStack>
          )}
        </Circle>
        <Text
          fontFamily="$body"
          fontSize="$3"
          textAlign="center"
          color={textColor}
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
          color={buttonColor}
          marginTop="$1"
        >
          Or skip for now
        </Button>
      </YStack>
    </YStack>
  )
}