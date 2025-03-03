import React, { useState } from 'react'
import { useColorScheme, TextInput } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { Ionicons } from '@expo/vector-icons'
import { useVault } from '@/hooks/useVault'
import { 
  VaultRecommendationCategory, 
  RecommendedVaultEntry, 
  getRecommendedVaultEntries
} from '@/utils/VaultRecommendations'

interface VaultRecommendationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: VaultRecommendationCategory
}

export function VaultRecommendationModal({ 
  open, 
  onOpenChange, 
  category 
}: VaultRecommendationModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const { addVaultEntry } = useVault()
  const [selectedEntries, setSelectedEntries] = useState<Record<number, boolean>>({})
  const [usernames, setUsernames] = useState<Record<number, string>>({})
  const [passwords, setPasswords] = useState<Record<number, string>>({})

  const handleToggleEntry = (index: number) => {
    setSelectedEntries(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  const handleUsernameChange = (index: number, value: string) => {
    setUsernames(prev => ({
      ...prev,
      [index]: value
    }))
  }
  
  const handlePasswordChange = (index: number, value: string) => {
    setPasswords(prev => ({
      ...prev,
      [index]: value
    }))
  }
  
  const handleSaveSelectedEntries = () => {
    const recommendedEntries = getRecommendedVaultEntries(category)
    Object.entries(selectedEntries).forEach(([indexStr, isSelected]) => {
      if (isSelected) {
        const index = parseInt(indexStr)
        const entry = recommendedEntries[index]
        const username = usernames[index] || ''
        const password = passwords[index] || ''
        
        if (username && password) {
          addVaultEntry({
            name: entry.name,
            username: username,
            password: password
          })
        }
      }
    })
    setSelectedEntries({})
    setUsernames({})
    setPasswords({})
    onOpenChange(false)
  }

  const recommendedEntries = getRecommendedVaultEntries(category)
  const hasValidSelections = Object.entries(selectedEntries).some(([indexStr, isSelected]) => {
    if (isSelected) {
      const index = parseInt(indexStr)
      const username = usernames[index] || ''
      const password = passwords[index] || ''
      return username.length > 0 && password.length > 0
    }
    return false
  })

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${category} Accounts`}
      snapPoints={[85]}
    >
      <YStack gap="$4" paddingBottom="$8">
        <Text 
          color={isDark ? "#dbd0c6" : "#666"} 
          fontSize={16}
          opacity={0.9}
        >
          Select accounts to add to your vault:
        </Text>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
          maxHeight={500}
        >
          <YStack gap="$3">
            {recommendedEntries.map((entry, index) => (
              <XStack 
                key={index}
                backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                borderRadius={12}
                padding="$3"
                borderWidth={1}
                borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                alignItems="center"
              >
                <Checkbox
                  checked={selectedEntries[index] || false}
                  onCheckedChange={() => handleToggleEntry(index)}
                  backgroundColor={selectedEntries[index] ? (isDark ? "#dbd0c6" : "#000") : "transparent"}
                  borderColor={isDark ? "#dbd0c6" : "#000"}
                  marginRight="$2"
                />
                
                <YStack flex={1} gap="$2">
                  <Text 
                    color={isDark ? "#fff" : "#000"} 
                    fontSize={16} 
                    fontWeight="500"
                  >
                    {entry.name}
                  </Text>
                  
                  {selectedEntries[index] && (
                    <YStack gap="$2">
                      <XStack alignItems="center" gap="$1">
                        <Ionicons name="person-outline" size={16} color={isDark ? "#999" : "#666"} />
                        <Text color={isDark ? "#999" : "#666"} fontSize={12} width={70}>
                          Username:
                        </Text>
                        <XStack 
                          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius={4}
                          flex={1}
                          alignItems="center"
                        >
                          <TextInput
                            value={usernames[index] || ''}
                            onChangeText={(value) => handleUsernameChange(index, value)}
                            style={{
                              backgroundColor: 'transparent',
                              color: isDark ? '#fff' : '#000',
                              fontSize: 12,
                              padding: 0,
                              flex: 1,
                              height: 20
                            }}
                          />
                        </XStack>
                      </XStack>
                      
                      <XStack alignItems="center" gap="$1">
                        <Ionicons name="lock-closed-outline" size={16} color={isDark ? "#999" : "#666"} />
                        <Text color={isDark ? "#999" : "#666"} fontSize={12} width={70}>
                          Password:
                        </Text>
                        <XStack 
                          backgroundColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.05)"}
                          paddingHorizontal="$2"
                          paddingVertical="$1"
                          borderRadius={4}
                          flex={1}
                          alignItems="center"
                        >
                          <TextInput
                            secureTextEntry={true}
                            value={passwords[index] || ''}
                            onChangeText={(value) => handlePasswordChange(index, value)}
                            style={{
                              backgroundColor: 'transparent',
                              color: isDark ? '#fff' : '#000',
                              fontSize: 12,
                              padding: 0,
                              flex: 1,
                              height: 20
                            }}
                          />
                        </XStack>
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              </XStack>
            ))}
          </YStack>
        </ScrollView>
        
        <Button
          backgroundColor={isDark ? "rgba(219, 208, 198, 0.2)" : "rgba(0, 0, 0, 0.1)"}
          color={isDark ? "#dbd0c6" : "#000"}
          borderRadius={8}
          paddingVertical="$3"
          marginTop="$4"
          onPress={handleSaveSelectedEntries}
          pressStyle={{ opacity: 0.7 }}
          disabled={!hasValidSelections}
          opacity={!hasValidSelections ? 0.5 : 1}
        >
          <Text 
            color={isDark ? "#dbd0c6" : "#000"} 
            fontSize={16} 
            fontWeight="600"
          >
            Add Selected Accounts
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  )
}
