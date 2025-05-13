// @ts-nocheck
import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { Project } from '@/types/project'
import { ProjectAttachments } from './ProjectCard/ProjectAttachments'
import { isIpad } from '@/utils/deviceUtils'
import { getPriorityColor } from '@/utils/styleUtils'
import { Plus } from '@tamagui/lucide-icons'
import { ProjectCardDetails } from './ProjectCard/details'
import { ProjectCardWrapper } from './ProjectCard/wrapper'
import { ProjectHeader } from './ProjectCard/header'
import { TaskList } from './ProjectCard/taskList'

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
            px={isWeb ? "$4" : isIpad() ? "$4" : "$3"} 
            pl={isWeb ? "$4" : isIpad() ? "$2" : "$2.5"} 
            br="$4"
            w={isIpad() ? "100%" : "100%"}
            ai="center"
            animation="quick"
            py={isIpad() ? "$3" : "$2.5"}
            pt={isIpad() ? "$2.5" : "$1"}
          >
            <YStack flex={1} gap="$2"> 
              <ProjectHeader project={project} isDark={isDark} priorityColor={priorityColor} />
              <YStack
                minWidth={isIpad() ? 420 : 240}
                pt={isIpad() ? '$1.5' : '$1'}
                mr={0}
              >
                <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
                <YStack
                  minWidth={isIpad() ? 400 : 240}
                  px={"$1"}
                  ml={isIpad() ? 24 : 12}
                  mr={isIpad() ? 24 : 12}
                >
                  <TaskList 
                    project={project} 
                    isDark={isDark} 
                    isIpad={isIpad} 
                    isWeb={isWeb} 
                    onToggleTaskCompleted={onToggleTaskCompleted} 
                  />
                </YStack>

                {project.attachments?.length > 0 && (
                  <YStack w="100%" mb={project.tasks?.length > 0 ? isIpad() ? 10 : 6 : 24} mx={isIpad() ? 10 : 6} mt={isIpad() ? 10 : 6}>
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

                {onOpenAddTaskModal && (
                  <XStack w="100%" flexBasis="100%" jc={(!project.tasks || project.tasks.length === 0) ? "center" : "flex-end"} px={0} mt={project.attachments?.length > 0 ? -30 : 10} mb={0} ai="center">
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
                      <Plus size={isIpad() ? 20 : 16} color={isDark ? '#c9c9c9' : '#555'} />
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
