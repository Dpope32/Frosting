import React, { useState } from 'react'
import { ScrollView, useColorScheme } from 'react-native'
import { YStack, Button, XStack, isWeb } from 'tamagui'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Database, Trash } from '@tamagui/lucide-icons'
import * as Haptics from 'expo-haptics'

import { addDevProjects, addWebsiteRedesignProject, addMobileAppProject, addHomeRenovationProject, addVacationProject } from '@/services/devServices'
import { isIpad } from '@/utils/deviceUtils'
import { ProjectEmpty } from '@/components/projects/ProjectEmpty'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/projects/projectCard'
import { AddProjectModal } from '@/components/cardModals/creates/AddProjectModal'
import { AddTaskToProjectModal } from '@/components/cardModals/creates/AddTaskToProjectModal'
import { TaskPriority, RecurrencePattern } from '@/types/task'
import { useProjectStore } from '@/store/ProjectStore'
import { useToastStore } from '@/store/ToastStore'
import EditProjectModal from '@/components/cardModals/edits/EditProjectModal'
import { SimpleImageViewer } from '@/components/notes/SimpleImageViewer'

export default function ProjectsScreen() {
  const { projects, isModalOpen, handleAddProject, handleCloseModal } = useProjects()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [addTaskModalOpen, setAddTaskModalOpen] = React.useState(false)
  const [selectedProjectId, setSelectedProjectId] = React.useState<string | null>(null)
  const clearProjects = useProjectStore((state) => state.clearProjects)
  const getProjectById = useProjectStore((state) => state.getProjectById)
  const updateProject = useProjectStore((state) => state.updateProject)
  const showToast = useToastStore((state) => state.showToast)
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [selectedEditProjectId, setSelectedEditProjectId] = React.useState<string | null>(null)
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null)

  // Filter out any non-project items (must be objects with an id) and filter out deleted or archived projects
  const validProjects = (projects || []).filter(project => 
    project && typeof project === 'object' && !Array.isArray(project) && 
    project.id && !project.isDeleted && !project.isArchived
  )

  // Sort projects so completed ones appear at the bottom
  const items = [...validProjects].sort((a, b) => {
    // If a is completed and b is not, a should come after b
    if (a.status === 'completed' && b.status !== 'completed') return 1
    // If b is completed and a is not, b should come after a
    if (b.status === 'completed' && a.status !== 'completed') return -1
    // If both have the same completion status, maintain their original order
    return 0
  })

  const deleteAllProjects = () => {
    clearProjects()
  }

  const handleOpenAddTaskModal = (projectId: string) => {
    setSelectedProjectId(projectId)
    setAddTaskModalOpen(true)
  }

  const handleSaveTask = (task: { name: string; completed: boolean; priority: TaskPriority }) => {
    if (!selectedProjectId) return
    const id = typeof crypto !== 'undefined' && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 9)
    const now = new Date()
    const newTask = {
      id,
      name: task.name,
      completed: task.completed,
      priority: task.priority as TaskPriority,
      schedule: [],
      category: 'task',
      completionHistory: {},
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
      recurrencePattern: 'one-time' as RecurrencePattern,
    }
    const project = getProjectById(selectedProjectId)
    if (project) {
      updateProject(selectedProjectId, { tasks: [...(project.tasks || []), newTask] })
      showToast('Task added to project!', 'success')
    }
    setAddTaskModalOpen(false)
    setSelectedProjectId(null)
  }

  const handleToggleTaskCompleted = (projectId: string, taskId: string, completed: boolean) => {
    const project = getProjectById(projectId)
    if (project) {
      if (!isWeb) {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      }
      const updatedTasks = (project.tasks || []).map((t: any) => t.id === taskId ? { ...t, completed } : t)
      updateProject(projectId, { tasks: updatedTasks })
      showToast(completed ? 'Task completed!' : 'Task marked as incomplete!', 'success')
    }
  }

  const handleArchiveProject = (projectId: string) => {
    if (!isWeb) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy)
    }
    updateProject(projectId, { isArchived: true })
    showToast('Project archived successfully!', 'success')
  }

  const handleAddExampleProject = (projectTypeOrProject: string | Project) => {
    // Get the project type
    const projectType = typeof projectTypeOrProject === 'string' 
      ? projectTypeOrProject 
      : 'Default';
      
    // Call the appropriate function based on project type
    switch(projectType) {
      case 'Website Redesign':
        addWebsiteRedesignProject();
        break;
      case 'Mobile App Dev':
        addMobileAppProject();
        break;
      case 'Kitchen Renovation':
        addHomeRenovationProject();
        break;
      case 'Summer Vacation':
        addVacationProject();
        break;
      default:
        // Only add a single default project if somehow we got here
        addWebsiteRedesignProject();
        break;
    }
    showToast(`Added ${projectType} example project!`, 'success');
  }

  // Handler specifically for the dev button
  const handleDevButtonClick = () => {
    // Only add projects once
    addDevProjects();
    showToast('All example projects added!', 'success');
  }

  return (
    <YStack f={1} pt={isWeb ? 80 : isIpad() ? isDark? 80:  70 : isDark? 85 : 75} bg={isDark ? '#000000' : '$backgroundLight'} px={isWeb? 24 : 0}>
      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: isWeb ? 8 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : isIpad() ? 20 : 12,
          paddingTop: isWeb ? 12 : 20,
          paddingLeft: isWeb ? 0 : isIpad() ? 20 : 16,
          display: 'flex',
          flexDirection: isWeb ? 'row' : 'column',
          alignItems: items.length === 0 ? 'center' : undefined,
          justifyContent: items.length === 0 ? 'flex-start' : undefined,
          flexWrap: isWeb && items.length > 0 ? 'wrap' : undefined,
          alignSelf: isWeb ? 'center' : 'flex-start',
          gap: isWeb ? 32 : isIpad() ? 16 : 16,
          minWidth: isWeb ? 1200 : "100%",
          maxWidth: isWeb ? 1200 : "100%",
        }}
      >
        {items.length === 0 ? (
            <ProjectEmpty
              isDark={isDark}
              primaryColor={primaryColor}
              onAddExampleProject={handleAddExampleProject}
            />
        ) : (
          items.map((project: Project, index) => (
            <YStack key={project.id || `project-${index}`} width={isWeb ? 'calc(33% - 16px)' : isIpad() ? '100%' : '100%'} mb={isWeb ? 0 : isIpad() ? 24 : '$1'}>
              <ProjectCard
                project={project}
                isDark={isDark}
                primaryColor={primaryColor}
                onOpenAddTaskModal={handleOpenAddTaskModal}
                onToggleTaskCompleted={(taskId, completed) => handleToggleTaskCompleted(project.id, taskId, completed)}
                onEdit={(id) => {
                  setSelectedEditProjectId(id)
                  setEditModalOpen(true)
                }}
                onArchive={handleArchiveProject}
                onImagePress={setSelectedImageUrl}
              />
            </YStack>
          ))
        )}
      </ScrollView>

      <Button
        onPress={handleAddProject}
        position="absolute"
        bottom={50}
        right={24}
        zIndex={1000}
        size="$4"
        circular
        bg={primaryColor}
        pressStyle={{ scale: 0.95 }}
        animation="quick"
        elevation={4}
      >
        <Plus color="white" size={24} />
      </Button>

      <AddProjectModal open={isModalOpen} isDark={isDark} onOpenChange={handleCloseModal} />

      <AddTaskToProjectModal
        open={addTaskModalOpen}
        projectName={selectedProjectId ? getProjectById(selectedProjectId)?.name || '' : ''}
        onOpenChange={(open) => {
          setAddTaskModalOpen(open)
          if (!open) setSelectedProjectId(null)
        }}
        onSave={handleSaveTask}
      />

      {selectedEditProjectId && (
        <EditProjectModal
          open={editModalOpen}
          onOpenChange={(o) => {
            setEditModalOpen(o)
            if (!o) setSelectedEditProjectId(null)
          }}
          projectId={selectedEditProjectId}
          isDark={isDark}
        />
      )}

      {__DEV__ && (
        <XStack position="absolute" bottom={40} left={24} gap="$2" zIndex={1000}>
          <Button
            size="$4"
            circular
            bg="#00AAFF"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={handleDevButtonClick}
            icon={<Database color="#FFF" size={20} />}
          />
          <Button
            size="$4"
            circular
            bg="#FF5555"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={deleteAllProjects}
            icon={<Trash color="#FFF" size={20} />}
          />
        </XStack>
      )}

      <BlurView
        intensity={20}
        tint={isDark ? 'dark' : 'light'}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: -1,
        }}
      />

      {selectedImageUrl && (
        <SimpleImageViewer
          imageUrl={selectedImageUrl}
          onClose={() => setSelectedImageUrl(null)}
          isDark={isDark}
        />
      )}
    </YStack>
  )
}
