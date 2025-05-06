import React from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Project } from '@/types/project'
import { ProjectCardHeader } from './ProjectCardHeader'
import { TaskListItem } from './TaskListItem'
import { getDaysUntilDeadline } from './projectCardUtils'

interface ProjectCardWebViewProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void
  onEdit?: (projectId: string) => void
}

export const ProjectCardWebView = ({
  project,
  isDark,
  primaryColor,
  onOpenAddTaskModal,
  onToggleTaskCompleted,
  onEdit
}: ProjectCardWebViewProps) => {
  return (
    <XStack
      bg={isDark ? '#111' : '#f5f5f5'}
      px="$4"
      br="$4"
      ai="center"
      animation="quick"
      width={300}
      minWidth={288}
      maxWidth={400}
      minHeight={120}
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
        <ProjectCardHeader 
          project={project}
          isDark={isDark}
          onOpenAddTaskModal={onOpenAddTaskModal}
          isWeb={true}
        />

        <XStack ai="center" gap="$2" mb="$2">
          <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
            Description:
          </Text>
          <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
            {project?.description || 'No description'}
          </Text>
        </XStack>

        {project?.deadline && (
          <XStack ai="center" gap="$2" mb="$2">
            <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
              Deadline:
            </Text>
            <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
              {getDaysUntilDeadline(project.deadline)}
            </Text>
          </XStack>
        )}

        {project.tasks?.length > 0 && (
          <>
            <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={8} mt={8} />
            <YStack pl="$4">
              <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={10} />
              {project.tasks.length > 1 && (
                <Text fontSize={12} color={isDark ? '#aaa' : '#444'} mb={2} fontFamily="$body">
                  {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                </Text>
              )}
              <XStack gap={12} flexWrap="wrap" mb={10} >
                {project.tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    isDark={isDark}
                    onToggleTaskCompleted={onToggleTaskCompleted}
                  />
                ))}
              </XStack>
            </YStack>
          </>
        )}
      </YStack>
    </XStack>
  )
}
