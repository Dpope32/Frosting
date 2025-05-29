import React from 'react'
import { XStack, YStack } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { isIpad } from '@/utils'
import { Platform } from 'react-native'

interface VaultCardSkeletonProps {
  isWeb: boolean
  isDark: boolean
  columnWidthWeb?: string
}

export const VaultCardSkeleton = ({ isWeb, isDark, columnWidthWeb }: VaultCardSkeletonProps) => {
  // Sizing matches VaultCard
  if (isWeb) {
    return (
      <XStack
        px="$5"
        py="$2"
        br="$4"
        ai="center"
        animation="quick"
        width={columnWidthWeb}
        minWidth={350}
        maxWidth={500}
        height={100}
        position="relative"
        overflow="hidden"
        borderWidth={1}
        borderColor={isDark ? '#333' : '#e0e0e0'}
        style={{ backgroundColor: isDark ? '#181818' : '#f5f5f5' }}
      >
        <LinearGradient
          colors={isDark ? ['#181818', '#232323', '#222'] : ['#f5f5f5', '#eaeaea']}
          start={{ x: 0, y: 0.5 }}
          end={{ x: 1, y: 1 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <YStack flex={1} gap="$2">
          <XStack jc="space-between" ai="center" mb="$1">
            <YStack bg={isDark ? '#333' : '#e0e0e0'} width={120} height={20} br={8} />
            <YStack bg={isDark ? '#222' : '#ddd'} width={32} height={20} br={8} />
          </XStack>
          <XStack ai="center" gap="$2" mb="$1">
            {!isIpad() && <YStack bg={isDark ? '#222' : '#e0e0e0'} width={70} height={16} br={6} />}
            <YStack bg={isDark ? '#444' : '#ccc'} flex={1} height={16} br={6} />
          </XStack>
          <XStack ai="center" gap="$2">
            <YStack bg={isDark ? '#222' : '#e0e0e0'} width={70} height={16} br={6} />
            <YStack bg={isDark ? '#444' : '#ccc'} flex={1} height={16} br={6} />
          </XStack>
        </YStack>
      </XStack>
    )
  }
  // Mobile/iPad
  return (
    <XStack
      p={isIpad() ? "$1.5" : "$1"}
      px={isWeb ? "$3.5" : isIpad() ? "$1" : "$4"}
      pl={isWeb ? "$3" : isIpad() ? "$2.5" : "$4"}
      br="$4"
      borderWidth={1}
      w={isIpad() ? "99%" : "100%"}
      borderColor={isDark ? '#333' : '#e0e0e0'}
      ai="center"
      animation="quick"
      py={isIpad() ? "$2" : "$2.5"}
      position="relative"
      overflow="hidden"
      style={{ backgroundColor: isDark ? '#181818' : '#f5f5f5' }}
    >
      <LinearGradient
        colors={isDark ? ['#181818', '#232323', '#222'] : ['#f5f5f5', '#eaeaea']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack flex={1} gap={isIpad() ? "$2" : "$1.5"}>
        <XStack jc="space-between" px={isIpad() ? "$2.5" : "$1"} mb={isIpad() ? "$1" : "$0.5"} ai="center">
          <YStack bg={isDark ? '#333' : '#e0e0e0'} width={100} height={18} br={8} />
          <YStack bg={isDark ? '#222' : '#ddd'} width={28} height={18} br={8} />
        </XStack>
        <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3" mb={isIpad() ? "$1" : 4}>
          {!isIpad() && <YStack bg={isDark ? '#222' : '#e0e0e0'} width={isIpad() ? 80 : 70} height={14} br={6} />}
          <YStack bg={isDark ? '#444' : '#ccc'} flex={1} height={14} br={6} />
        </XStack>
        <XStack ai="center" gap={isIpad() ? "$3" : "$1"} ml="$3">
          <YStack bg={isDark ? '#222' : '#e0e0e0'} width={isIpad() ? 80 : 70} height={14} br={6} />
          <YStack bg={isDark ? '#444' : '#ccc'} flex={1} height={14} br={6} />
        </XStack>
      </YStack>
    </XStack>
  )
} 