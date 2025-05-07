import React from 'react'
import { XStack, Text } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { tagColors } from '@/utils/styleUtils'

interface ProjectHeaderProps {
  project: Project
  isDark: boolean
  priorityColor: string
}

export const ProjectHeader = ({ project, isDark, priorityColor }: ProjectHeaderProps) => {
  return (
    <>
      <XStack px={isIpad() ? "$2" : "$1"} ai="center" py={isIpad() ? "$2.5" : "$2"} mt={isIpad() ? "$-1" : 6} ml={6}>
        <XStack ai="center" gap="$2" flexWrap="wrap" f={1}>
          <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? 19 : 17} fontWeight="bold" fontFamily="$body">
            {project.name}
          </Text>
          <MaterialIcons name="circle" size={12} color={priorityColor} />
        </XStack>
      </XStack>
      <XStack ai="center" px={isIpad() ? "$3" : "$3"} my={-4}> 
        {project?.tags && Array.isArray(project.tags) && project.tags.length > 0 ? (
          <>
            <XStack ai="center">
              {project.tags.map((tag, index) => (
                <XStack
                  key={tag.id}
                  alignItems="center"
                  backgroundColor={`${tagColors[index % tagColors.length]}15`}
                  px="$1"
                  py="$0.5"
                  br={12}
                  opacity={0.9}
                  mr={4}
                >
                  <Text
                    fontFamily="$body"
                    color={tagColors[index % tagColors.length]}
                    fontSize={isIpad() ? 15 : 13} 
                    fontWeight="500"
                    paddingHorizontal={4}
                  >
                    {tag.name.toLowerCase()}
                  </Text>
                </XStack>
              ))}
              {renderStatusBadge(project, isDark)}
            </XStack>
          </>
        ) : (
          renderStatusBadge(project, isDark)
        )}
      </XStack>
    </>
  )
}

// Helper function to render status badge
const renderStatusBadge = (project: Project, isDark: boolean) => {
  if (!project?.status) return null;
  
  return (
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
          : (isDark ? 'rgba(113, 148, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
      }
      py="$0.5"
      br={12}
      opacity={0.8}
      ai="center"
      ml={0}
    >
      <Text
        paddingHorizontal={"$1.5"}
        paddingVertical={"$0.5"}
        color={
          project.status === 'completed'
            ? '$green10'
            : project.status === 'in_progress'
            ? '$blue10'
            : project.status === 'pending'
            ? '$yellow10'
            : project.status === 'past_deadline'
            ? '$red10'
            : (isDark ? '$blue10' : '#333')
        }
        fontSize={isIpad() ? 13 : 12}
        fontFamily="$body"
      >
        {project.status.replace('_', ' ')}
      </Text>
    </XStack>
  );
};
