import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { VaultRecommendationChip } from '@/constants/recommendations/VaultRecommendations'

interface VaultEmptyProps {
  isDark: boolean
  primaryColor: string
  isWeb: boolean
  setSocialMediaModalOpen: (open: boolean) => void
  setEmailCloudModalOpen: (open: boolean) => void
  setShoppingModalOpen: (open: boolean) => void
  setWorkModalOpen: (open: boolean) => void
}

export const VaultEmpty = ({
  isDark,
  primaryColor,
  isWeb,
  setSocialMediaModalOpen,
  setEmailCloudModalOpen,
  setShoppingModalOpen,
  setWorkModalOpen
}: VaultEmptyProps) => {
  return (
    <XStack
      bg={isDark ? '#1A1A1A' : '#f5f5f5'}
      p="$4"
      br="$4"
      ai="flex-start"
      jc="center"
      borderWidth={1}
      borderColor={isDark ? '#222' : '#e0e0e0'}
      width="100%"
    >
      <YStack gap="$3" width="100%" paddingTop={16}>
        <YStack gap="$3" px="$2">
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Store Your Credentials
              </Text>
              <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" mt="$1">
                Add usernames and passwords for all your accounts in one secure location.
              </Text>
            </YStack>
          </XStack>
          
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                End-to-End Encryption
              </Text>
              <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" mt="$1">
                All data is stored locally and protected using advanced cryptography techniques.
              </Text>
            </YStack>
          </XStack>
          
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize={isWeb ? "$4" : "$3"} fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Easy Access & Management
              </Text>
              <Text color={isDark ? '#aaa' : '#666'} fontSize="$3" fontFamily="$body" mt="$1">
                Quickly view, add, or remove entries with a simple and intuitive interface.
              </Text>
            </YStack>
          </XStack>
        </YStack>
        
        <Text color={isDark ? '#666' : '#888'} fontSize="$3" textAlign="center" fontFamily="$body" mt="$6" mb="$2">
          Quick add from common categories:
        </Text>
        
        <YStack width="100%">
          <XStack 
            justifyContent={isWeb ? "space-between" : "flex-start"}
            px="$2"
            gap="$2"
            flexWrap="wrap"
            width="100%"
            flexDirection="row"
          >
            <VaultRecommendationChip 
              category="Social Media" 
              onPress={() => setSocialMediaModalOpen(true)} 
              isDark={isDark}
              isMainScreen={true}
            />
            <VaultRecommendationChip 
              category="Misc" 
              onPress={() => setEmailCloudModalOpen(true)} 
              isDark={isDark}
              isMainScreen={true}
            />
            <VaultRecommendationChip 
              category="Shopping" 
              onPress={() => setShoppingModalOpen(true)} 
              isDark={isDark}
              isMainScreen={true}
            />
            <VaultRecommendationChip 
              category="Work" 
              onPress={() => setWorkModalOpen(true)} 
              isDark={isDark}
              isMainScreen={true}
            />
          </XStack>
        </YStack>
        
        <Text color={isDark ? '#666' : '#888'} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          Or click the + button below to add a custom entry
        </Text>
      </YStack>
    </XStack>
  )
}
