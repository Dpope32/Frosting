// Lightweight project preview card used on the LandingPage mobile view
import React from 'react'
import { Pressable, Platform, useColorScheme } from 'react-native'
import { XStack, YStack, Text, Image } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Project } from '@/types'
import { isIpad, getPriorityColor } from '@/utils'

interface ProjectPreviewCardProps {
  project: Project
  onPress: () => void
}

export function ProjectPreviewCard({ project, onPress }: ProjectPreviewCardProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const priorityColor = getPriorityColor(project.priority)
  
  const hasTasks = project.tasks && project.tasks.length > 0

  // Status component that can be reused
  const statusComponent = project.status ? (
    <XStack
      bg={
        project.status === 'completed'
          ? 'rgba(0, 128, 0, 0.1)'
          : project.status === 'in_progress'
          ? 'rgba(0, 0, 255, 0.1)'
          : project.status === 'pending'
          ? 'rgba(255, 255, 0, 0.1)'
          : project.status === 'past_deadline'
          ? 'rgba(255, 0, 0, 0.1)'
          : isDark
          ? 'rgba(113, 148, 255, 0.1)'
          : 'rgba(0, 0, 0, 0.1)'
      }
      py="$0.5"
      px="$1"
      br={12}
      opacity={0.9}
      ai="center"
    >
      <Text
        fontFamily="$body"
        fontSize={isIpad() ? 12 : 11}
        py="$0.5"
        px="$1"
        color={
          project.status === 'completed'
            ? '$green10'
            : project.status === 'in_progress'
            ? '$blue10'
            : project.status === 'pending'
            ? '$yellow10'
            : project.status === 'past_deadline'
            ? '$red10'
            : isDark
            ? '$blue10'
            : '#777777'
        }
      >
        {project.status.replace('_', ' ')}
      </Text>
    </XStack>
  ) : null

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync()
        }
        onPress()
      }}
      style={{
        width: isIpad() ? "84%" : '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: isIpad() ? 24 : 18,
      }}
    >
      <YStack
        borderRadius={12}
        overflow="hidden"
        mb={isIpad() ? 2 : 0}
        style={{
          backgroundColor: isDark ? 'rgba(15, 16, 20, 0.5)' : 'rgba(35, 40, 54, 0.9)',
          borderColor: isDark ? '#1e2229' : '#21252e',
          borderWidth: isDark ? 1 : 1.5,
        }}
      >
        <LinearGradient
          colors={isDark ? 
            ['#121519', '#14171c', '#16191f', '#181b22'] : 
            ['#363b47', '#2c3038', '#22252c', '#18191f']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0,
            borderRadius: 11,
            opacity: 1,
          }}
        />
        <XStack
          padding={isIpad() ? 7 : 7}
          paddingBottom={isIpad() ? 7 : 7}
          paddingTop={isIpad() ? 7 : 7}
          paddingHorizontal={isIpad() ? '$3' : '$3'}
          borderLeftWidth={3}
          borderLeftColor={priorityColor}
          borderRadius={12}
          minHeight={50}
          gap={isIpad() ? '$2' : '$2'}
        >
          <YStack flex={1} gap="$1">
            <XStack py={"$1"} jc="space-between" ai="center">
              <Text
                fontFamily="$heading"
                fontWeight="900"
                color={isDark ? "#f0f0f0" : "#ffffff"}
                fontSize={isIpad() ? 15 : 14}
                maxWidth={'70%'}
                elevation={2}
                shadowColor="#000"
                shadowOffset={{ width: 0, height: 2 }}
                shadowOpacity={0.2}
                shadowRadius={2}
                ellipse
                numberOfLines={1}
              >
                {project.name}
              </Text>
              {hasTasks && statusComponent}
              {project.deadline && (() => {
                let d: Date | undefined
                if (typeof project.deadline === 'string') d = new Date(project.deadline)
                else if (project.deadline instanceof Date) d = project.deadline
                if (d && !isNaN(d.getTime())) {
                  return (
                    <XStack alignItems="center" gap="$1">
                      <MaterialIcons name="event" size={isIpad() ? 14 : 10} color={isDark ? '#999' : '#999'} />
                      <Text fontSize={isIpad() ? 13 : 11} color={isDark ? "#a0a0a0" : "#e0e0e0"}>
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </XStack>
                  )
                }
                return null
              })()}
            </XStack>

            <XStack jc="space-between" gap="$2.5" px={"$1"} ai="center">
            {project.people && project.people.length > 0 && (
              <XStack gap="$1" ai="center" mt={0}>
                {project.people.slice(0, 3).map((person) => (
                  <YStack
                    key={person.id}
                    br={isIpad() ? 14 : 10}
                    overflow="hidden"
                    width={isIpad() ? 22 : 20}
                    height={isIpad() ? 22 : 20}
                    marginBottom={isIpad() ? 0 : 0}
                  >
                    {person.profilePicture ? (
                      <Image
                        source={{ uri: person.profilePicture }}
                        style={{ width: '100%', height: '100%'}}
                      />
                    ) : (
                      <YStack flex={1} ai="center" jc="center" backgroundColor={isDark ? '$gray3' : '$gray6'}>
                        <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={10}>
                          {person.name.charAt(0).toUpperCase()}
                        </Text>
                      </YStack>
                    )}
                  </YStack>
                ))}
              </XStack>
            )}
            {hasTasks ? (
              <Text fontSize={isIpad() ? 13 : 12} color={isDark ? '#7c7c7c' : '#9c9c9c'} fontFamily="$body">
                {project.tasks.filter(t => t.completed).length}/{project.tasks.length} tasks completed
              </Text>
            ) : (
              statusComponent
            )}
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </Pressable>
  )
}

export default ProjectPreviewCard;
