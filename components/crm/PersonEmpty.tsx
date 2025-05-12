import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient';
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
      p={isWeb ? "$6" : "$4"} 
      br="$4" 
      ai="flex-start"
      jc="center"
      borderWidth={1} 
      borderColor={isDark ? "#333" : "#e0e0e0"} 
      width={isWeb ? "50%" : "97%"} 
      maxWidth={isWeb ? 600 : "100%"} 
      mx={isWeb ? "auto" : "$1"}
      marginTop={isWeb ? 10 : 10}
      overflow="hidden"
      py={isWeb ? "$6" : "$4"}
      pt={isWeb ? "$6" : "$5"}
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack gap="$2" width="100%" position="relative"> 
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
              mt={isWeb ? "$2" : "$3"}
              br="$4"
              pressStyle={{ opacity: 0.8 }}
              animation="quick"
              onPress={onImportContacts}
              icon={<FontAwesome5 name="address-book" size={16} color="white" style={{ marginRight: 8 }} />}
            >
              <Text color="white" fontSize={isWeb ? "$4" : "$3"} fontFamily="$body" fontWeight="600">
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
