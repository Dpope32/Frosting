import React from 'react'
import { Platform, useColorScheme } from 'react-native'
import { YStack, Text } from 'tamagui'
import { useProjectStore } from '@/store/ProjectStore'
import { useUserStore } from '@/store/UserStore'
import { ProjectPreviewCard } from '@/components/home/ProjectPreviewCard'
import { isIpad } from '@/utils/deviceUtils'
import { useRouter } from 'expo-router'

// This component previews a list of projects for the user on **mobile only**.
// It renders nothing on web and also hides itself when there are no projects.
export function ProjectSection() {
  // Fetch projects from our dedicated ProjectStore (different from the task store!)
  const projects = useProjectStore((s) => s.projects)
  // Color / theme helpers
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const primaryColor = useUserStore((s) => s.preferences.primaryColor)
  const router = useRouter()

  // Guard clauses – only mobile & only when projects exist
  if (Platform.OS === 'web') return null
  if (!projects || projects.length === 0) return null

  // First filter out any non-project items (must be objects with an id) and then filter out completed projects
  const validProjects = projects.filter(project => project && typeof project === 'object' && !Array.isArray(project) && project.id);
  const filteredProjects = validProjects.filter(project => project.status !== 'completed' && !project.isDeleted);
 
  return (
    <YStack w="100%" gap={isIpad() ? '$2' : '$2'} py={'$0.5'} pt={isIpad() ? '$4' : '$3'} ai="center">
      <YStack px={isIpad() ? '$1' : '$0'} ai="center">
        {filteredProjects.map((project, index) => (
          <ProjectPreviewCard
            key={project.id || `project-${index}`}
            project={project}
            onPress={() => router.push('/projects')}
          />
        ))}
      </YStack>
    </YStack>
  )
}

export default ProjectSection;
