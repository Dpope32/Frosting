import React from 'react'
import { Image, Pressable, Switch } from 'react-native'
import { Circle, Text, XStack, YStack } from 'tamagui'

type ProfileSectionProps = {
  profilePicture?: string
  registered?: boolean
  priority: boolean
  favorite?: boolean
  onPickImage: () => void
  onToggleRegistered?: (val: boolean) => void
  onToggleFavorite?: (val: boolean) => void
  onTogglePriority?: (val: boolean) => void
  primaryColor: string
  isDark: boolean
}

export function ProfileSection({
  profilePicture,
  registered,
  priority,
  favorite,
  onPickImage,
  onToggleFavorite,
  onTogglePriority,
  primaryColor,
  isDark
}: ProfileSectionProps) {
  return (
    <YStack width={90} gap="$4" alignItems="center">
      {profilePicture ? (
        <Pressable onPress={onPickImage}>
          <Image
            source={{ uri: profilePicture }}
            style={{ width: 90, height: 90, borderRadius: 45 }}
          />
        </Pressable>
      ) : (
        <Circle
          size={90}
          backgroundColor={isDark ? "#333333" : "#E0E0E0"}
          pressStyle={{ backgroundColor: isDark ? "#444444" : "#D0D0D0" }}
          onPress={onPickImage}
        >
          <Text fontSize={24} color={isDark ? "#888888" : "#666666"} fontFamily="$body">+</Text>
        </Circle>
      )}
      
      <YStack width="100%" gap="$2" alignItems="center">
        <XStack alignItems="center" gap="$2" justifyContent="space-between" width="100%">
          <Text color={isDark ? "#888888" : "#666666"} fontSize={13} fontFamily="$body">Favorite</Text>
          <Switch
            value={favorite}
            onValueChange={onToggleFavorite}
            trackColor={{ 
              false: isDark ? '#383838' : '#E0E0E0', 
              true: primaryColor 
            }}
            thumbColor="white"
            style={{ transform: [{ scale: 0.8 }] }}
          />
        </XStack>
        
        <XStack alignItems="center" gap="$2" justifyContent="space-between" width="100%">
          <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={13} fontFamily="$body">Priority?</Text>
          <Switch
            value={priority}
            onValueChange={onTogglePriority}
            trackColor={{ 
              false: isDark ? '#383838' : '#E0E0E0', 
              true: "#FFD700" 
            }}
            thumbColor="white"
            style={{ transform: [{ scale: 0.8 }] }}
          />
        </XStack>
      </YStack>
    </YStack>
  );
}