import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { Project } from '@/types'
import { getPriorityColor, isIpad } from '@/utils'
import { MaterialIcons } from '@expo/vector-icons'
import { ProjectAttachments, ProjectCardDetails, ProjectCardWrapper, ProjectHeader, TaskList } from './ProjectCard/'

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
    
    return (
        <ProjectCardWrapper 
          project={project} 
          isDark={isDark} 
          priorityColor={priorityColor} 
          onEdit={onEdit}
          onArchive={onArchive}
          hideCompletedOverlay={hideCompletedOverlay}
        >
          <XStack
            p={isIpad() ? "$3" : "$2"} 
            px={isWeb ? "$4" : isIpad() ? "$4" : "$3.5"} 
            pl={isWeb ? "$4" : isIpad() ? "$3" : "$3"} 
            br="$4"
            w={isIpad() ? "100%" : "100%"}
            ai="center"
            animation="quick"
            py={isIpad() ? "$2.5" : "$2"}
            pt={isIpad() ? "$2" : "$1.5"}
          >
            <YStack flex={1} gap="$2"> 
              <ProjectHeader project={project} isDark={isDark} priorityColor={priorityColor} />
              <YStack
                minWidth={isIpad() ? 420 : 240}
                pt={isIpad() ? '$1.5' : '$1'}
                mr={0}
              >
                <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
                {project.attachments?.length > 0 && (
                  <YStack w="100%" mb={project.tasks?.length > 0 ? isIpad() ? 0 : 0 : 0} mx={isIpad() ? 16 : 10} mt={isIpad() ? 10 : 6}>
                    <ProjectAttachments 
                      attachments={project.attachments} 
                      isDark={isDark} 
                      onImagePress={(url) => {
                        if (onImagePress) {
                          onImagePress(url);
                        }
                      }}
                    />
                  </YStack>
                )}
                <YStack
                  minWidth={isIpad() ? 400 : 240}
                  px={"$1"}
                  ml={isIpad() ? 24 : 12}
                  mr={isIpad() ? 24 : 12}
                  mb={isIpad() ? 10 : 6}
                >
                  <TaskList 
                    project={project} 
                    isDark={isDark} 
                    isIpad={isIpad} 
                    isWeb={isWeb} 
                    onToggleTaskCompleted={onToggleTaskCompleted} 
                  />
                </YStack>
                {onOpenAddTaskModal && (
                  <XStack w="100%" flexBasis="100%" jc={(!project.tasks || project.tasks.length === 0) ? "center" : "flex-end"} pr={10} pl={16} mt={project.attachments?.length > 0 ? 8 : 10} mb={8} ai="center">
                    {(!project.tasks || project.tasks.length === 0) && (
                      <Text color={isDark ? '#f6f6f6' : '#666'} fontSize={isIpad() ? 15 : 13} fontFamily="$body" ml={12} mr={project.tasks?.length > 0 ? 0 : 20} opacity={0.6}>
                        Add your first task to get started
                      </Text>
                    )}
                    <Button
                      size={isIpad() ? "$2" : 24}
                      circular
                      backgroundColor="transparent"
                      onPress={() => onOpenAddTaskModal(project.id)}
                      ai="center"
                      borderColor={isDark ? '#222' : '#9f9f9f'}
                      borderWidth={1}
                      jc="center"
                    >
                      <MaterialIcons name="add" size={isIpad() ? 20 : 16} color={isDark ? '#c9c9c9' : '#555'} />
                    </Button>
                  </XStack>
                )}
              </YStack>
            </YStack>
          </XStack>
        </ProjectCardWrapper>
    )
}

export default ProjectCardMobile;
