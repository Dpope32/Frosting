import React from 'react'
import { YStack, Text, Button, XStack } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

export const AppleButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    backgroundColor="#000"
    borderRadius="$8"
    borderWidth={1}
    borderColor="#333"
    paddingHorizontal="$5"
    paddingVertical="$4"
    minWidth={160}
    height={60}
    pressStyle={{ opacity: 0.85, scale: 0.97 }}
    onPress={onPress}
    style={{ cursor: 'pointer' }}
  >
    <XStack alignItems="center" gap="$3" justifyContent="center">
      <Ionicons name="logo-apple" size={28} color="#fff" />
      <YStack alignItems="flex-start" justifyContent="center">
        <Text color="#fff" fontSize="$4" fontWeight="600" lineHeight={1.1}>
          App Store
        </Text>
      </YStack>
    </XStack>
  </Button>
)

export const GoogleButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    backgroundColor="#000"
    borderRadius="$8"
    borderWidth={1}
    borderColor="#333"
    paddingHorizontal="$5"
    paddingVertical="$4"
    minWidth={160}
    height={60}
    pressStyle={{ opacity: 0.85, scale: 0.97 }}
    onPress={onPress}
    style={{ cursor: 'pointer' }}
  >
    <XStack alignItems="center" gap="$3" justifyContent="center">
      <Ionicons name="logo-google-playstore" size={28} color="#48C5F6" />
      <YStack alignItems="flex-start" justifyContent="center">
        <Text color="#fff" fontSize="$4" fontWeight="600" lineHeight={1.1}>
          Google Play
        </Text>
      </YStack>
    </XStack>
  </Button>
)

export const DownloadButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    backgroundColor="rgba(22, 20, 20, 0.64)"
    borderRadius="$8"
    borderWidth={1}
    borderColor="#333"
    paddingHorizontal="$5"
    paddingVertical="$4"
    minWidth={160}
    height={60}
    pressStyle={{ opacity: 0.85, scale: 0.97 }}
    onPress={onPress}
    style={{ cursor: 'pointer' }}
  >
    <XStack alignItems="center" gap="$3" justifyContent="center">
      <Ionicons name="download" size={24} color="#fff" alignItems="center" justifyContent="center" />
      <YStack alignItems="flex-start" justifyContent="center">
        <Text color="#fff" fontSize="$4" fontWeight="600" lineHeight={1.1}>   
          Desktop Download
        </Text>
      </YStack>
    </XStack>
  </Button>
) 

export const ManifestoButton = ({ onPress }: { onPress: () => void }) => (
  <Button
    backgroundColor="rgba(43, 230, 255, 0.11)"
    borderRadius="$8"
    borderWidth={1}
    borderColor="rgba(43, 230, 255, 0.11)"
    paddingHorizontal="$5"
    paddingVertical="$4"
    minWidth={160}
    height={60}
    pressStyle={{ opacity: 0.85, scale: 0.97 }}
    onPress={onPress}
    style={{ cursor: 'pointer' }}
  >
    <XStack alignItems="center" gap="$3" justifyContent="center">
      <Ionicons name="document-text" size={28} color="rgb(43, 230, 255)" />
      <YStack alignItems="flex-start" justifyContent="center">
        <Text color="rgb(43, 230, 255)" fontSize="$4" fontWeight="600" lineHeight={1.1}>   
          Manifesto
        </Text>
      </YStack>
    </XStack>
  </Button>
) 
