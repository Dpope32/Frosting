import { YStack, XStack, Button, Text, Label } from 'tamagui'
import { Image } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Squircle } from '@/components/ui/Squircle'
import { BackgroundStyleOption, FormData } from '@/types'
import { BackgroundStyle } from '@/constants/Backgrounds'

export default function Step3({
  formData,
  setFormData,
  backgroundStyles,
  getWallpaperPath,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  backgroundStyles: BackgroundStyleOption[]
  getWallpaperPath: (style: BackgroundStyle) => any
}) {
  return (
    <YStack gap="$4" flex={1} justifyContent="center" padding="$4">
      <Label size="$8" textAlign="center" color="$gray12Dark">
        Background
      </Label>

      <YStack gap="$4" alignItems="center">
        <XStack gap="$3" justifyContent="center" flexWrap="wrap">
          {backgroundStyles.map((style) => (
            <Button
              key={style.value}
              backgroundColor={
                formData.backgroundStyle === style.value
                  ? formData.primaryColor
                  : '$gray4Dark'
              }
              borderColor="$gray8Dark"
              onPress={() =>
                setFormData((prev) => ({
                  ...prev,
                  backgroundStyle: style.value as FormData['backgroundStyle'],
                }))
              }
            >
              <Text color="$gray12Dark">{style.label}</Text>
            </Button>
          ))}
        </XStack>

        <Squircle
          style={{
            width: 150,
            height: 150,
            borderWidth: 2,
            borderColor: formData.primaryColor,
          }}
        >
          {formData.backgroundStyle === 'gradient' && (
            <LinearGradient
              colors={['#ffffff', formData.primaryColor]}
              style={{ flex: 1 }}
            />
          )}
          {formData.backgroundStyle === 'opaque' && (
            <YStack backgroundColor={formData.primaryColor} flex={1} />
          )}
          {formData.backgroundStyle.startsWith('wallpaper-') && (
            <Image
              source={getWallpaperPath(formData.backgroundStyle)}
              style={{ width: '100%', height: '100%' }}
              resizeMode="cover"
            />
          )}
        </Squircle>
      </YStack>
    </YStack>
  )
}
