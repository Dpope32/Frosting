// spotify.tsx
import { YStack, Text } from 'tamagui'

export default function SpotifyScreen() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Text 
        fontSize="$6" 
        fontWeight="bold" 
        color="$gray12Dark"
        textAlign="center"
      >
        Coming Soon
      </Text>
    </YStack>
  )
}