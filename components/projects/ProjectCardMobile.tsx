import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { Project } from '@/types/project'
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
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
  onEdit?: (projectId: string) => void;
}

export const ProjectCardMobile = ({ project, isDark, primaryColor, onOpenAddTaskModal, onToggleTaskCompleted, onEdit }: ProjectCardMobileProps) => {
    const priorityColor = getPriorityColor(project.priority);
    return (
        <ProjectCardWrapper 
          project={project} 
          isDark={isDark} 
          priorityColor={priorityColor} 
          onEdit={onEdit}
        >
          <XStack
            p={isIpad() ? "$3" : "$2"} 
            px={isWeb ? "$4" : isIpad() ? "$3" : "$3"} 
            pl={isWeb ? "$4" : isIpad() ? "$3" : "$2.5"} 
            br="$4"
            w={isIpad() ? "100%" : "100%"}
            ai="center"
            animation="quick"
            py={isIpad() ? "$3" : "$2.5"}
            pt={isIpad() ? "$2" : "$1"}
          >
            <YStack flex={1} gap="$2"> 
              <ProjectHeader project={project} isDark={isDark} priorityColor={priorityColor} />
              <YStack
                minWidth={isIpad() ? 380 : 240}
                p={isIpad() ? '$4' : '$1.5'}
                pt={isIpad() ? '$2' : '$1'}
                ml={0}
                mr={0}
              >
                <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
                <YStack
                  minWidth={isIpad() ? 380 : 240}
                  px={"$1"}
                  ml={isIpad() ? 16 : 12}
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

                {onOpenAddTaskModal && (
                  <XStack w="100%" flexBasis="100%" jc={(!project.tasks || project.tasks.length === 0) ? "space-between" : "flex-end"} px={0} mt={isIpad() ? 18 : 12} mb={0} ai="center">
                    {(!project.tasks || project.tasks.length === 0) && (
                      <Text color={isDark ? '#f6f6f6' : '#666'} fontSize={isIpad() ? 15 : 13} fontFamily="$body" ml={12} opacity={0.8}>
                        Add your first task to get started
                      </Text>
                    )}
                    <Button
                      size="$2"
                      circular
                      backgroundColor="transparent"
                      onPress={() => onOpenAddTaskModal(project.id)}
                      ai="center"
                      jc="center"
                    >
                      <Plus size={20} color={isDark ? '#f6f6f6' : '#111'} />
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
