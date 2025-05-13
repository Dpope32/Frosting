import React from 'react'
import { XStack, Text, Button } from 'tamagui'
import { Plus } from '@tamagui/lucide-icons'
import { Project } from '@/types/project'
import { ProjectStatusBadge } from './ProjectStatusBadge'
import { MaterialIcons } from '@expo/vector-icons'

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
        {project.deadline && (() => {
          let d: Date | undefined;
          if (typeof project.deadline === 'string') d = new Date(project.deadline);
          else if (project.deadline instanceof Date) d = project.deadline;
          if (!d || isNaN(d.getTime())) return null;
          return (
            <XStack ai="center" gap="$1">
              <MaterialIcons name="event" size={isWeb ? 14 : 12} color={isDark ? '#999' : '#999'} />
              <Text fontSize={isWeb ? '$3' : '$4'} color={isDark ? '#f6f6f6' : '#222'} fontFamily="$body">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </XStack>
          );
        })()}
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
