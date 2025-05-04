import React from 'react'
import { ScrollView, useColorScheme } from 'react-native'
import { YStack, Button, isWeb } from 'tamagui'
import { BlurView } from 'expo-blur'
import { useUserStore } from '@/store/UserStore'
import { useProjects } from '@/hooks/useProjects'
import { Plus } from '@tamagui/lucide-icons'
import { isIpad } from '@/utils/deviceUtils'
import { ProjectEmpty } from '@/components/projects/ProjectEmpty'
import { Project } from '@/types/project'
import { ProjectCard } from '@/components/projects/projectCard'
import { AddProjectModal } from '@/components/cardModals/AddProjectModal'

export default function ProjectsScreen() {
  const { projects, isModalOpen, handleAddProject, handleCloseModal } = useProjects()
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  const items = projects || []

  return (
    <YStack f={1} pt={isWeb ? 80 : isIpad() ? isDark? 80:  70 : 90} bg={isDark ? '#000000' : '#f6f6f6'} paddingLeft={isWeb? 24 : isIpad() ? 24 : 0}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: isWeb ? 8 : 6,
          paddingBottom: 100,
          paddingHorizontal: isWeb ? 0 : 16,
          paddingTop: isWeb ? 0 : 20,
          paddingLeft: isWeb ? 12 : 16,
          display: isWeb ? 'flex' : 'flex',
          flexDirection: isWeb ? 'row' : 'column',
          flexWrap: isWeb ? 'wrap' : 'wrap',
          justifyContent: isWeb ? 'flex-start' : 'flex-start',
          gap: isWeb ? 32 : 16,
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
            <YStack key={project.id} width={isWeb ? 'calc(33% - 16px)' : '100%'} mb={isWeb ? 0 : '$3'}>
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
