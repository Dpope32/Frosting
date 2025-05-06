import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { Project } from '@/types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'

interface ProjectCardHeaderProps {
  project: Project
  isDark: boolean
  onOpenAddTaskModal?: (projectId: string) => void
  isWeb: boolean
}

export const ProjectCardHeader = ({ 
  project,
  isDark,
  onOpenAddTaskModal,
  isWeb
}: ProjectCardHeaderProps) => {
  return (
    <XStack jc="space-between" ai="center" mt="$1" mb="$2">
      <XStack ai="center" gap="$2" f={1} flexWrap="wrap">
        <Text 
          color={isDark ? '#f6f6f6' : '#222'} 
          fontSize={isWeb ? "$4" : "$5"} 
          fontWeight="bold" 
          fontFamily="$body"
        >
          {project.name}
        </Text>
        <ProjectStatusBadge project={project} isDark={isDark} />
      </XStack>
      
      <Button 
        size="$2" 
        circular 
        onPress={() => onOpenAddTaskModal?.(project.id)}
      >
        <Plus size={16} />
      </Button>
    </XStack>
  )
}
