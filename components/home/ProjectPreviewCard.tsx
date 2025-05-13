// Lightweight project preview card used on the LandingPage mobile view
import React from 'react'
import { Pressable, Platform, useColorScheme, ViewStyle, DimensionValue } from 'react-native'
import { XStack, YStack, Text, Image } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { getPriorityColor } from '@/utils/styleUtils'

interface ProjectPreviewCardProps {
  project: Project
  onPress: () => void
}

export function ProjectPreviewCard({ project, onPress }: ProjectPreviewCardProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const priorityColor = getPriorityColor(project.priority)

  return (
    <Pressable
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync()
        }
        onPress()
      }}
      style={{
        width: isIpad() ? 455 : '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        paddingHorizontal: isIpad() ? 24 : 18,
      }}
    >
      <YStack
        borderRadius={12}
        overflow="hidden"
        mb={isIpad() ? 6 : 2}
        style={{
          backgroundColor: isDark ? 'rgb(33, 33, 33)' : 'rgba(253, 253, 253, 0.17)',
          borderColor: isDark ? 'rgba(39, 39, 39, 0.8)' : 'rgba(255, 255, 255, 0.1)',
          borderWidth:  1,
        }}
      >
        <LinearGradient
          colors={isDark ? 
            [ 
             'rgba(0, 0, 0, 0.9)',
             'rgba(5, 5, 5, 0.9)',
             'rgba(15, 14, 14, 0.8)',
             'rgba(19, 19, 19, 0.7)', 
             'rgba(30, 30, 30, 0.6)'
            ] : [
               'rgba(42, 42, 42, 0.57)',
               'rgba(23, 23, 23, 0.66)',
               'rgba(53, 50, 50, 0.79)',
               'rgba(40, 38, 38, 0.57)',
               'rgba(0, 0, 0, 0.75)',
            ]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
        />
        <XStack
          padding={isIpad() ? 10 : 3}
          paddingBottom={isIpad() ? 14 : 8}
          paddingTop={isIpad() ? 14 : 6}
          paddingHorizontal={isIpad() ? '$4' : '$3'}
          borderLeftWidth={3}
          borderLeftColor={priorityColor}
          borderRadius={12}
          gap={isIpad() ? '$3' : '$2'}
        >
          <YStack flex={1} gap="$1">
            <XStack py={"$1.5"} jc="space-between" ai="center">
              <Text
                fontFamily="$heading"
                fontWeight="900"
                color={isDark ? "#dbd0c6" : "#dbd0c6"}
                fontSize={isIpad() ? 15 : 13}
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
              {project.deadline && (() => {
                let d: Date | undefined
                if (typeof project.deadline === 'string') d = new Date(project.deadline)
                else if (project.deadline instanceof Date) d = project.deadline
                if (d && !isNaN(d.getTime())) {
                  return (
                    <XStack alignItems="center" gap="$1">
                      <MaterialIcons name="event" size={isIpad() ? 14 : 10} color={isDark ? '#999' : '#999'} />
                      <Text fontSize={isIpad() ? 13 : 11} color={isDark ? "#dbd0c6" : "#dbd0c6"}>
                        {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </XStack>
                  )
                }
                return null
              })()}
            </XStack>

            <XStack jc="flex-start" gap="$2.5" ai="center">
            {project.status && (
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
              )}
              {project.tasks && project.tasks.length > 0 && (
                <Text fontSize={12} color={isDark ? '#ccc' : '#9c9c9c'} fontFamily="$body">
                  {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                </Text>
              )}
             {project.people && project.people.length > 0 && (
              <XStack gap="$1" ai="center" mt={0}>
                {project.people.slice(0, 3).map((person) => (
                  <YStack
                    key={person.id}
                    br={isIpad() ? 14 : 10}
                    overflow="hidden"
                    width={isIpad() ? 24 : 20}
                    height={isIpad() ? 24 : 20}
                    marginBottom={isIpad() ? -6 : 0}
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
            </XStack>
          </YStack>
        </XStack>
      </YStack>
    </Pressable>
  )
}

export default ProjectPreviewCard;
