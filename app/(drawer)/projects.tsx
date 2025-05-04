import React from 'react'
import { ScrollView, useColorScheme } from 'react-native'
import { YStack, Button, XStack, isWeb } from 'tamagui'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useProjects } from '@/hooks/useProjects'
import { Plus, Database, Trash } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'
import { ProjectEmpty } from '@/components/projects/ProjectEmpty'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/projects/projectCard'
import { AddProjectModal } from '@/components/cardModals/AddProjectModal'
import { useProjectStore } from '@/store/ProjectStore'

export default function ProjectsScreen() {
  const { projects, isModalOpen, handleAddProject, handleCloseModal } = useProjects()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const items = projects || []

  // Dev helpers: load sample projects and clear all projects
  const addProject = useProjectStore(state => state.addProject)
  const clearProjects = useProjectStore(state => state.clearProjects)

  const loadDevProjects = () => {
    // define sample projects with explicit Project type to satisfy TypeScript
    const sampleProjects: Project[] = [
      ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
        name: 'Sample Project 1',
        description: 'This is a sample project',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
        tags: [
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            name: 'Feature',
            color: 'blue',
          },
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            name: 'Urgent',
            color: 'red',
          },
        ],
        status: 'pending',
        priority: 'medium',
        isArchived: false,
        isDeleted: false,
        tasks: [],
        people: [],
        notes: [],
        attachments: [],
      } as Project),
      ({
        id: typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : Math.random().toString(36).substring(2, 9),
        name: 'Sample Project 2',
        description: 'Another sample project',
        createdAt: new Date(),
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        tags: [
          {
            id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 9),
            name: 'Backend',
            color: 'green',
          },
        ],
        status: 'in_progress',
        priority: 'high',
        isArchived: false,
        isDeleted: false,
        tasks: [],
        people: [],
        notes: [],
        attachments: [],
      } as Project),
    ]
    sampleProjects.forEach((project, index) => {
      setTimeout(() => addProject(project), index * 300)
    })
  }

  const deleteAllProjects = () => {
    clearProjects()
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
          items.map((project: Project) => (
            <YStack key={project.id} width={isWeb ? 'calc(33% - 16px)' : '100%'} mb={isWeb ? 0 : '$1'}>
              <ProjectCard
                project={project}
                isDark={isDark}
                primaryColor={primaryColor}
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

      {__DEV__ && (
        <XStack position="absolute" bottom={40} left={24} gap="$2" zIndex={1000}>
          <Button
            size="$4"
            circular
            bg="#00AAFF"
            pressStyle={{ scale: 0.95 }}
            animation="quick"
            elevation={4}
            onPress={loadDevProjects}
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
