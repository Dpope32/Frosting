import React from 'react'
import { XStack, Text, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types'
import { getPriorityColor } from '@/utils'

export const ProjectStatusBadge = ({ project, isDark }: { project: Project; isDark: boolean }) => {
  const priorityColor = getPriorityColor(project.priority)
  
  return (
    <>
      <MaterialIcons name="circle" size={isWeb? 20 : 12} color={priorityColor} />
      {project?.status && (
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
              : (isDark ? '#222' : '#eee')
          }
          px={isWeb? "$2" : "$1.5"}
          py={isWeb? "$1" : "$0.5"}
          br="$4"
          ai="center"
        >
          <Text
            color={
              project.status === 'completed'
                ? '$green10'
                : project.status === 'in_progress'
                ? '$blue10'
                : project.status === 'pending'
                ? '$yellow10'
                : project.status === 'past_deadline'
                ? '$red10'
                : '$gray10'
            }
            fontSize={isWeb? "$3" : "$2"}
            fontFamily="$body"
          >
            {project.status.replace('_', ' ')}
          </Text>
        </XStack>
      )}
    </>
  )
}
