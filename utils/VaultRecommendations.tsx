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
        { name: 'Yahoo Mail' },
        { name: 'iCloud' },
        { name: 'ProtonMail' },
        { name: 'Google Drive' },
        { name: 'Dropbox' },
        { name: 'OneDrive' },
        { name: 'Box' },
        { name: 'iCloud Drive' },
        { name: 'pCloud' },
        { name: 'MEGA' }
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
        { name: 'Google Workspace' },
        { name: 'Microsoft 365' },
        { name: 'Trello' },
        { name: 'Asana' },
        { name: 'Jira' },
        { name: 'Notion' },
        { name: 'GitHub' },
        { name: 'GitLab' },
        { name: 'Figma' },
        { name: 'Adobe Creative Cloud' },
        { name: 'Salesforce' },
        { name: 'HubSpot' }
      ]
    default:
      return []
  }
}

export const VaultRecommendationChip: React.FC<VaultRecommendationChipProps> = ({ category, onPress, isDark = false }) => {
  const getChipStyle = () => {
    switch (category) {
      case 'Social Media':
        return {
          backgroundColor: "rgba(239, 68, 68, 0.15)", // red
          borderColor: "rgba(239, 68, 68, 0.3)",
          iconName: "people-outline" as const,
          iconColor: "#ef4444",
          textColor: "#ef4444"
        }
      case 'Misc':
        return {
          backgroundColor: "rgba(59, 130, 246, 0.15)", // blue
          borderColor: "rgba(59, 130, 246, 0.3)",
          iconName: "cloud-outline" as const,
          iconColor: "#3b82f6",
          textColor: "#3b82f6"
        }
      case 'Shopping':
        return {
          backgroundColor: "rgba(16, 185, 129, 0.15)", // green
          borderColor: "rgba(16, 185, 129, 0.3)",
          iconName: "cart-outline" as const,
          iconColor: "#10b981",
          textColor: "#10b981"
        }
      case 'Work':
        return {
          backgroundColor: "rgba(139, 92, 246, 0.15)", // purple
          borderColor: "rgba(139, 92, 246, 0.3)",
          iconName: "briefcase-outline" as const,
          iconColor: "#8b5cf6",
          textColor: "#8b5cf6"
        }
      default:
        return {
          backgroundColor: "rgba(107, 114, 128, 0.15)", // gray
          borderColor: "rgba(107, 114, 128, 0.3)",
          iconName: "add-circle-outline" as const,
          iconColor: "#6b7280",
          textColor: "#6b7280"
        }
    }
  }

  const style = getChipStyle()

  return (
    <Button
      backgroundColor={style.backgroundColor}
      borderColor={style.borderColor}
      borderWidth={1}
      borderRadius={8}
      paddingHorizontal="$3"
      paddingVertical="$1"
      onPress={onPress}
      pressStyle={{ opacity: 0.7 }}
      scale={1}
      minWidth={0}
      flex={1}
      maxWidth={Platform.OS === 'web' ? 'auto' : '25%'}
    >
      <XStack gap="$1" alignItems="center" justifyContent="center">
        <Ionicons name={style.iconName} size={12} color={style.iconColor} />
        <Text 
          color={style.textColor} 
          fontSize={10} 
          fontWeight="600"
          numberOfLines={1}
        >
          {category}
        </Text>
      </XStack>
    </Button>
  )
}
