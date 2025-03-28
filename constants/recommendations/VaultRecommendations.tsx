import React from 'react'
import { Platform } from 'react-native'
import { XStack, Button, Text } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'

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
        { name: 'Discord' },
        { name: 'WhatsApp' },
        { name: 'Telegram' },
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
        { name: 'Walmart' },
        { name: 'Target' },
        { name: 'Best Buy' },
        { name: 'Etsy' },
        { name: 'PayPal' },
        { name: 'Venmo' },
        { name: 'Cash App' },
        { name: 'Shopify' },
        { name: 'Wayfair' },
        { name: 'Apple Store' },
        { name: 'Google Play Store' },
        { name: 'Costco' },
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
  const getChipStyle = () => {
    switch (category) {
      case 'Social Media':
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red
          borderColor: "rgba(239, 68, 68, 0.3)",
          iconName: "people-outline" as const,
          iconColor: "#ef4444",
          textColor: "#ef4444",
          fontFamil: "body"
        }
      case 'Misc':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          iconName: "cloud-outline" as const,
          iconColor: "#3b82f6",
          textColor: "#3b82f6",
          fontFamil: "body"
        }
      case 'Shopping':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          iconName: "cart-outline" as const,
          iconColor: "#10b981",
          textColor: "#10b981",
          fontFamil: "body"
        }
      case 'Work':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          iconName: "briefcase-outline" as const,
          iconColor: "#8b5cf6",
          textColor: "#8b5cf6",
          fontFamil: "body"
        }
      default:
        return {
          backgroundColor: "rgba(107, 114, 128, 0.15)", // gray
          borderColor: "rgba(107, 114, 128, 0.3)",
          iconName: "add-circle-outline" as const,
          iconColor: "#6b7280",
          textColor: "#6b7280",
          fontFamil: "body"
        }
    }
  }

  const style = getChipStyle()

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