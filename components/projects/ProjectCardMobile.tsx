import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { Project } from '@/types'
import { getPriorityColor, isIpad } from '@/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { ProjectCardDetails, ProjectCardWrapper, ProjectHeader, TaskList } from './ProjectCard/'

interface ProjectCardMobileProps {
  project: Project
  isDark: boolean
  onImagePress?: (url: string) => void;
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
  onEdit?: (projectId: string) => void;
  onArchive?: (projectId: string) => void;
  hideCompletedOverlay?: boolean;
}

export const ProjectCardMobile = ({ 
  project, 
  isDark, 
  onImagePress,
  onOpenAddTaskModal, 
  onToggleTaskCompleted, 
  onEdit,
  onArchive,
  hideCompletedOverlay = false
}: ProjectCardMobileProps) => {
    const priorityColor = getPriorityColor(project.priority);
    const hasNoTasks = !project.tasks || project.tasks.length === 0;
    const hasDescription = project?.description && project.description.trim() !== '';
    const hasPeople = project.people && project.people.length > 0;
    const hasContent = hasDescription || hasPeople;

    return (
        <ProjectCardWrapper 
          project={project} 
          isDark={isDark} 
          priorityColor={priorityColor} 
          onEdit={onEdit}
          onArchive={onArchive}
          hideCompletedOverlay={hideCompletedOverlay}
        >
          <YStack 
            p={isIpad() ? "$2.5" : "$2.5"} 
            px={isIpad() ? "$4" : "$3.5"} 
            pb={isIpad() ? (hasContent ? "$5" : "$4") : "$4"}
            gap={hasContent || !hasNoTasks ? "$2" : "$1.5"}
            w="100%"
          >
            <ProjectHeader project={project} isDark={isDark} priorityColor={priorityColor} />
            
            {hasContent && (
              <YStack px={isIpad() ? "$1" : "$0.5"}>
                <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
              </YStack>
            )}
            
            <YStack 
              px={isIpad() ? "$2" : "$1"}
              gap="$2"
              mt={hasContent ? "$0" : "$-1"}
              pb={isIpad() ? "$4" : "$3.5"}
            >
              <TaskList 
                project={project} 
                isDark={isDark} 
                isIpad={isIpad} 
                isWeb={isWeb} 
                onToggleTaskCompleted={onToggleTaskCompleted}
                onOpenAddTaskModal={onOpenAddTaskModal}
                priorityColor={priorityColor}
              />

              {onOpenAddTaskModal && hasNoTasks && (
                <YStack 
                  pt={hasContent ? "$2" : "$1"}
                  pb="$1.5"
                >
                  <XStack ai="center" px="$2" gap="$2">
                    <Text 
                      color={isDark ? 'rgba(246, 246, 246, 0.6)' : 'rgba(102, 102, 102, 0.8)'} 
                      fontSize={isIpad() ? 15 : 13} 
                      fontFamily="$body"
                    >
                      Add your first task to get started
                    </Text>
                    
                    <Button
                      size={isIpad() ? "$3" : "$2.5"}
                      circular
                      backgroundColor={isDark ? 'rgba(34, 34, 34, 0.8)' : 'rgba(245, 245, 245, 0.9)'}
                      borderColor={isDark ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.6)'}
                      borderWidth={1}
                      onPress={() => onOpenAddTaskModal(project.id)}
                      pressStyle={{
                        backgroundColor: isDark ? 'rgba(50, 50, 50, 1)' : 'rgba(230, 230, 230, 1)',
                        borderColor: priorityColor,
                        scale: 0.95,
                      }}
                      hoverStyle={{
                        backgroundColor: isDark ? 'rgba(40, 40, 40, 1)' : 'rgba(240, 240, 240, 1)',
                        borderColor: priorityColor,
                      }}
                    >
                      <MaterialIcons 
                        name="add" 
                        size={isIpad() ? 22 : 18} 
                        color={isDark ? '#d0d0d0' : '#555'} 
                      />
                    </Button>
                  </XStack>
                </YStack>
              )}
            </YStack>
          </YStack>
        </ProjectCardWrapper>
    )
}

export default ProjectCardMobile;