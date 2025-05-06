import React from 'react'
import { ScrollView, useColorScheme } from 'react-native'
import { YStack, Button, XStack, isWeb } from 'tamagui'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Database, Trash } from '@tamagui/lucide-icons'
import * as Haptics from 'expo-haptics'

import { addDevProjects } from '@/services/devServices'
import { isIpad } from '@/utils/deviceUtils'
import { ProjectEmpty } from '@/components/projects/ProjectEmpty'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/projects/projectCard'
import { AddProjectModal } from '@/components/cardModals/AddProjectModal'
import { AddTaskToProjectModal } from '@/components/cardModals/AddTaskToProjectModal'
import { TaskPriority, RecurrencePattern } from '@/types/task'
import { useProjectStore } from '@/store/ProjectStore'
import { useToastStore } from '@/store/ToastStore'
import EditProjectModal from '@/components/cardModals/EditProjectModal'

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
  // Filter out any non-project items (must be objects with an id) and filter out deleted projects
  const validProjects = (projects || []).filter(project => 
    project && typeof project === 'object' && !Array.isArray(project) && project.id && !project.isDeleted
  )
  const items = validProjects
  const [editModalOpen, setEditModalOpen] = React.useState(false)
  const [selectedEditProjectId, setSelectedEditProjectId] = React.useState<string | null>(null)

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

  const handleAddDevProjects = () => {
    addDevProjects()
    showToast('Dev projects added!', 'success')
  }

  return (
    <YStack f={1} pt={isWeb ? 80 : isIpad() ? isDark? 80:  70 : 90} bg={isDark ? '#000000' : '#f6f6f6'} paddingLeft={isWeb? 24 : isIpad() ? 0 : 0}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: isWeb ? 8 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 12,
          paddingTop: isWeb ? 0 : 20,
          paddingLeft: isWeb ? 12 : 16,
          display: isWeb ? 'flex' : 'flex',
          flexDirection: isWeb ? 'row' : 'column',
          flexWrap: isWeb ? 'wrap' : 'wrap',
          justifyContent: isWeb ? 'flex-start' : 'flex-start',
          gap: isWeb ? 32 : isIpad() ? 16 : 16,
          maxWidth: isWeb ? 1800 : "100%",
          marginHorizontal: isWeb ? 'auto' : 'auto',
        }}
      >
        {items.length === 0 ? (
          <ProjectEmpty
            isDark={isDark}
            primaryColor={primaryColor}
          />
        ) : (
          items.map((project: Project, index) => (
            <YStack key={project.id || `project-${index}`} width={isWeb ? 'calc(33% - 16px)' : '100%'} mb={isWeb ? 0 : '$1'}>
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
            onPress={handleAddDevProjects}
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
    </YStack>
  )
}
