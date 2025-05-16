import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { getChipStyle } from '@/utils'

export interface RecommendedVaultEntry {
  name: string
  username?: string
}

export type VaultRecommendationCategory = 'Social Media' | 'Misc' | 'Shopping' | 'Work'

export interface VaultRecommendationChipProps {
  category: VaultRecommendationCategory
  onPress: () => void
  isDark?: boolean
  isMainScreen?: boolean 
}

export const getRecommendedVaultEntries = (category: VaultRecommendationCategory): RecommendedVaultEntry[] => {
  switch (category) {
    case 'Social Media':
      return [
        { name: 'Facebook' },
        { name: 'Twitter' },
        { name: 'Instagram' },
        { name: 'LinkedIn' },
        { name: 'TikTok' },
        { name: 'Pinterest' },
        { name: 'Snapchat' },
        { name: 'Reddit' },
        { name: 'YouTube' }
      ]
    case 'Misc':
      return [
        { name: 'Gmail' },
        { name: 'Outlook' },
        { name: 'iCloud' },
        { name: 'Docker' },
        { name: 'Google' },
        { name: 'School' },
        { name: 'Discover' },
        { name: 'Bank' },
      ]
    case 'Shopping':
      return [
        { name: 'Amazon' },
        { name: 'eBay' },
        { name: 'Target' },
        { name: 'Best Buy' },
        { name: 'PayPal' },
        { name: 'Venmo' },
        { name: 'Cash App' },
        { name: 'Wayfair' },
        { name: 'Shein' }
      ]
    case 'Work':
      return [
        { name: 'Slack' },
        { name: 'Zoom' },
        { name: 'Microsoft Teams' },
        { name: 'Microsoft 365' },
        { name: 'Trello' },
        { name: 'Jira' },
        { name: 'Notion' },
        { name: 'GitHub' },
        { name: 'Figma' },
        { name: 'Salesforce' },
      ]
    default:
      return []
  }
}

export const VaultRecommendationChip: React.FC<VaultRecommendationChipProps> = ({ 
  category, 
  onPress, 
  isDark = false,
  isMainScreen = false // Default to false
}) => {


  const style = getChipStyle(category)

  return (
    <Button
      backgroundColor={style.backgroundColor}
      borderColor={style.borderColor}
      borderWidth={1}
      br={8}
      px="$3"
      py={isMainScreen ? "$2" : "$1"}
      fontFamily="$body"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={Platform.OS === 'web' ? 1 : 0}
      width={Platform.OS === 'web' ? 'auto' : '48%'}
      marginBottom={Platform.OS === 'web' ? 0 : '$2'}
    >
      <XStack gap="$1" alignItems="center" justifyContent="center">
        {!isMainScreen && <Ionicons name={style.iconName} size={12} color={style.iconColor} />}
        <Text 
          color={style.textColor}  
          fontSize={isMainScreen ? 13 : 12}  
          fontWeight="600" 
          numberOfLines={1} 
          fontFamily="$body" 
        > 
          {category} 
        </Text>
      </XStack>
    </Button>
  )
}