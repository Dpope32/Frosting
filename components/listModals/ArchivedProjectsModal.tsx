// components/cardModals/ArchivedProjectsModal.tsx
import React from 'react'
import { YStack, isWeb, Text } from 'tamagui' 
import { Platform } from 'react-native'
import { useColorScheme } from '@/hooks/useColorScheme'

import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { ProjectCard } from '@/components/projects/projectCard'
import { useProjectStore, useUserStore } from '@/store'
import { Sheet } from 'tamagui'
import { isIpad } from '@/utils'
import { Project } from '@/types/project'
import { ScrollView as RNScrollView } from 'react-native'

interface ArchivedProjectsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export const ArchivedProjectsModal: React.FC<ArchivedProjectsModalProps> = ({ open, onOpenChange }) => {
  const allProjects = useProjectStore(s => s.projects)
  const updateProject = useProjectStore(s => s.updateProject)
  const isDark = useColorScheme() === 'dark'
  const { preferences } = useUserStore()
  const userColor = useUserStore(s => s.preferences.primaryColor)

  // Filter for only archived projects
  const archivedProjects = React.useMemo(() => {
    return allProjects.filter(project => 
      project && typeof project === 'object' && !Array.isArray(project) && 
      project.id && project.isArchived && !project.isDeleted
    )
  }, [allProjects])

  // Handle toggling task completion within archived projects
  const handleToggleTaskCompleted = (projectId: string, taskId: string, completed: boolean) => {
    const project = archivedProjects.find(p => p.id === projectId)
    if (project) {
      const updatedTasks = (project.tasks || []).map((t: any) => t.id === taskId ? { ...t, completed } : t)
      updateProject(projectId, { tasks: updatedTasks })
    }
  }

  // Handle unarchiving a project
  const handleUnarchiveProject = (projectId: string) => {
    updateProject(projectId, { isArchived: false })
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <BaseCardModal
        open={open}
        onOpenChange={onOpenChange}
        title="Archived Projects"
        showCloseButton={true}
        hideHandle={true}
        snapPoints={[80]}
      >
        <YStack px={isIpad() ? "$2" : "$1.5"} gap="$1.5" pb={isIpad() ? "$2" : "$1.5"}>
          {archivedProjects.length === 0 ? (
            <YStack p="$4" ai="center" jc="center" height={200}>
              <Text 
                color={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.6)"} 
                fontSize={16} 
                textAlign="center"
              >
                No archived projects found.
              </Text>
            </YStack>
          ) : (
            <YStack gap="$3" mt="$2">
              {Platform.OS === 'web' ? (
                <RNScrollView 
                  contentContainerStyle={{ 
                    display: 'flex', 
                    flexDirection: 'row', 
                    flexWrap: 'wrap', 
                    gap: 16 
                  }}
                >
                  {archivedProjects.map((project: Project) => (
                    <YStack 
                      key={project.id} 
                      width={isWeb ? "calc(50% - 8px)" : "100%"} 
                      mb="$2"
                    >
                      <ProjectCard
                        project={project}
                        isDark={isDark}
                        primaryColor={userColor}
                        onToggleTaskCompleted={(taskId, completed) => 
                          handleToggleTaskCompleted(project.id, taskId, completed)
                        }
                        onArchive={handleUnarchiveProject} 
                        hideCompletedOverlay={true}
                      />
                    </YStack>
                  ))}
                </RNScrollView>
              ) : (
                <Sheet.ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
                  <YStack gap="$3">
                    {archivedProjects.map((project: Project) => (
                      <YStack key={project.id} mb="$2">
                        <ProjectCard
                          project={project}
                          isDark={isDark}
                          primaryColor={userColor}
                          onToggleTaskCompleted={(taskId, completed) => 
                            handleToggleTaskCompleted(project.id, taskId, completed)
                          }
                          onArchive={handleUnarchiveProject} 
                          hideCompletedOverlay={true}
                        />
                      </YStack>
                    ))}
                  </YStack>
                </Sheet.ScrollView>
              )}
            </YStack>
          )}
        </YStack>
      </BaseCardModal>
    </GestureHandlerRootView>
  )
}
