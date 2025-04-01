import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { FontAwesome5 } from '@expo/vector-icons'

interface PersonEmptyProps {
  isDark: boolean
  primaryColor: string
  isWeb: boolean
  onImportContacts?: () => void
}

export const PersonEmpty = ({
  isDark,
  primaryColor,
  onImportContacts
}: PersonEmptyProps) => {
  return (
    <XStack 
      bg={isDark ? "#1A1A1A" : "#f5f5f5"}
      p={ isWeb ? "$6" : "$4"} 
      br="$4" 
      ai="flex-start" 
      jc="center"
      borderWidth={1}
      borderColor={isDark ? "#333" : "#e0e0e0"}
      width={isWeb ? "80%" : "90%"}
      maxWidth={isWeb ? 800 : "100%"}
      mx="auto"
      my="$4"
    >
      <YStack gap="$4" width="100%" paddingTop={16}>
        <YStack gap="$3" px="$2">
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Track Important Contacts
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Add your contacts and keep track of important information in one place.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Birthday Reminders
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Never miss a birthday with automatic calendar integration.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Contact Details
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Store phone numbers, emails, addresses, and more for easy access.
              </Text>
            </YStack>
          </XStack>
        </YStack>
        <XStack justifyContent="center">
          {!isWeb && onImportContacts && (
            <Button
              size="$3"
              bc={primaryColor}
              borderColor={primaryColor}
              borderWidth={2}
              px="$4"
              py="$2"
              br="$4"
              pressStyle={{ opacity: 0.8 }}
              animation="quick"
              onPress={onImportContacts}
              icon={<FontAwesome5 name="address-book" size={16} color="white" style={{ marginRight: 8 }} />}
            >
              <Text color="white" fontWeight="600">
                Import Contacts
              </Text>
            </Button>
          )}
        </XStack>
        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          {isWeb ? "Click the + icon below to add your first contact!" : "Or click the + button below to add a contact manually"}
        </Text>
      </YStack>
    </XStack>
  )
}
