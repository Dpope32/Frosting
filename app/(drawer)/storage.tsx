// storage.tsx
import { YStack, Text, Button } from 'tamagui'

export default function StorageScreen() {
  return (
    <YStack flex={1} justifyContent="center" alignItems="center" padding="$4">
      <Button
        size="$8"
        backgroundColor="$gray4Dark"
        borderRadius="$8"
        pressStyle={{
          scale: 0.98,
          backgroundColor: '$gray5Dark',
        }}
        width={200}
        height={200}
      >
        <Text fontSize="$6" fontWeight="bold" color="$gray12Dark">
          Upload
        </Text>
      </Button>
    </YStack>
  )
}