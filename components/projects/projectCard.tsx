import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { EyeOff } from '@tamagui/lucide-icons'
import { useTagStore } from '@/store/TagStore'  

interface ProjectCardProps {
  project: Project
  isDark: boolean
  primaryColor: string
}

const columnWidthWeb = isWeb ? 300 : isIpad() ? 200 : 100

export const ProjectCard = ({ project, isDark, primaryColor }: ProjectCardProps) => {
    const tags = useTagStore((state) => state.tags)
    return isWeb ? (
        <XStack
          bg={isDark ? '#111' : '#f5f5f5'}
          px="$4"
          br="$4"
          borderWidth={1}
          borderColor={isDark ? '#121212' : '#e0e0e0'}
          ai="center"
          animation="quick"
          width={columnWidthWeb}
          minWidth={288}
          maxWidth={400}
          height={120}
          hoverStyle={{
            transform: [{ scale: 1.02 }],
            borderColor: primaryColor,
            shadowColor: primaryColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <YStack flex={1}>
            <XStack jc="space-between" ai="center" mt="$1" mb="$2">
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                {project.name}
              </Text>
            </XStack>
    
            <XStack ai="center" gap={ "$2"} mb="$2">
              {!isIpad() && (
                <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                  Description:
                </Text>
              )}
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.description}
              </Text>
            </XStack>
    
            <XStack ai="center" gap={"$2"} mb="$2">
              <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                Deadline:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.deadline}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      ) : (
        <XStack
          bg={isDark ? '#111' : 'rgba(234, 234, 234, 0.8)'}
          p={isIpad() ? "$2" : "$1.5"}
          px={isWeb ? "$4" : isIpad() ? "$2.5" : "$4"}
          pl={isWeb ? "$4" : isIpad() ? "$2.5" : "$4"}
          br="$4"
          borderWidth={0.5}
          w={isIpad() ? "100%" : "100%"}
          borderColor={isDark ? '#777' : '#e0e0e0'}
          ai="center"
          animation="quick"
          py={isIpad() ? "$3" : "$2.5"}
          pt={isIpad() ? "$3" : "$3"}
        >
          <YStack flex={1}>
            <XStack jc="space-between" px={isIpad() ? "$2" : "$1"} mb={isIpad() ? "$1" : "$1"} ai="center" mt={isIpad() ? "$-1" : 0}>
              <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                {project.name}
              </Text>
            </XStack>
            <XStack ai="center" gap={"$2"} my="$2" px={isIpad() ? "$2" : "$2"}>
              <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={80} fontFamily="$body">
                Description:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.description}
              </Text>
            </XStack>
            <XStack ai="center" gap={"$2"} mb="$2" px={isIpad() ? "$2" : "$2"}>
              <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={80} fontFamily="$body">
                Deadline:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.deadline}
              </Text>
            </XStack>
            <XStack ai="center" gap={"$2"} mb="$2" px={isIpad() ? "$2" : "$2"}>
              <Text color={isDark ? '#666' : '#666'} fontSize="$3" w={80} fontFamily="$body">
                Tags:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.tags.map((tag) => tag.name).join(', ')}
              </Text>
            </XStack>
          </YStack>
        </XStack>
      )
}

export default ProjectCard;
