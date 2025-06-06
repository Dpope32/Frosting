import React from 'react'
import { XStack, Text, Button, } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types'
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
    <XStack jc="space-between" ai="center" mt={isWeb? "$5" : "$1"} ml={isWeb? 16 : 0} mb="$2">
      <XStack ai="center" gap={isWeb? "$2" : "$2"} f={1} flexWrap="wrap">
        <Text 
          color={isDark ? '#f6f6f6' : '#222'} 
          fontSize={isWeb ? "$5" : "$5"} 
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
              <MaterialIcons name="event" size={isWeb ? 16 : 12} color={isDark ? '#999' : '#999'} />
              <Text fontSize={isWeb ? 12 : '$4'} color={isDark ? '#f6f6f6' : '#222'} fontFamily="$body">
                {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </Text>
            </XStack>
          );
        })()}
      </XStack>
      
      <Button 
        size="$2" 
        bg="transparent"
        borderWidth={1}
        marginTop={isWeb ? 0 : 0}
        borderColor={isDark ? '#222' : '#f5f5f5'}
        circular 
        onPress={() => onOpenAddTaskModal?.(project.id)}
        pressStyle={{
          bg: isDark ? '#222' : '#f5f5f5',
        }}
      >
        <MaterialIcons name="add" size={16} color={isDark ? '#f6f6f6' : '#222'} />
      </Button>
    </XStack>
  )
}
