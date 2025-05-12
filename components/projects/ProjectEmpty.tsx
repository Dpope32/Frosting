import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { LinearGradient } from 'expo-linear-gradient';
import { FontAwesome5 } from '@expo/vector-icons'
import { ProjectExampleChip } from './ProjectExampleChip';
import { Project } from '@/types/project';
import { 
  addWebsiteRedesignProject, 
  addMobileAppProject,
  addHomeRenovationProject,
  addVacationProject
} from '@/services/devServices';
import { useToastStore } from '@/store/ToastStore';

interface ProjectEmptyProps {
  isDark: boolean
  primaryColor: string
  onAddExampleProject?: (project: Project) => void
}

export const ProjectEmpty = ({
  isDark,
  primaryColor,
  onAddExampleProject
}: ProjectEmptyProps) => {
  
  const exampleProjects = [
    { title: "Website", addFn: addWebsiteRedesignProject },
    { title: "Mobile App", addFn: addMobileAppProject },
    { title: "Home Reno", addFn: addHomeRenovationProject },
    { title: "Vacation", addFn: addVacationProject }
  ];

  const handleExampleProjectPress = (index: number) => {
    const projectTitle = exampleProjects[index].title;
    if (onAddExampleProject) {
      onAddExampleProject(projectTitle as unknown as Project);
    }
  };

  return (
    <XStack 
      p={isWeb ? "$6" : "$4"} 
      br="$4" 
      ai="flex-start"
      jc="center"
      borderWidth={1} 
      borderColor={isDark ? "#333" : "#e0e0e0"} 
      width={isWeb ? "50%" : "90%"} 
      maxWidth={isWeb ? 600 : "100%"} 
      mx={isWeb ? "auto" : "$2"}
      marginTop={isWeb ? 10 : 10}
      overflow="hidden"
    >
      <LinearGradient
        colors={isDark ? ['rgb(34, 34, 34)', 'rgb(0, 0, 0)'] : ['#ffffff', '#eeeeee']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
      />
      <YStack gap="$3" width="100%" paddingTop={12} position="relative"> 
        <YStack gap="$3" px="$2">
          <XStack gap="$2" ai="flex-start">
              <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Supercharge Your Workflow
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Bring all your tasks, images, contacts, and resources together in one powerful hub.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Smart Deadlines
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Never miss a milestone with intuitive deadline tracking and progress visualization.
              </Text>
            </YStack>
          </XStack>
          <XStack gap="$2" ai="flex-start">
            <Text color={primaryColor} fontSize="$4" fontWeight="bold" fontFamily="$body">•</Text>
            <YStack>
              <Text color={isDark ? "#fff" : "#333"} fontSize="$4" fontWeight="bold" fontFamily="$body">
                Visual Project Management
              </Text>
              <Text color={isDark ? "#aaa" : "#666"} fontSize="$3" fontFamily="$body">
                Track status, priorities, attachments, and team members with beautiful visual organization.
              </Text>
            </YStack>
          </XStack>
        </YStack>

        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$2">
          Try out these example projects:
        </Text>
        <YStack width="100%">
          <XStack 
            justifyContent={isWeb ? "space-between" : "center"}
            px="$2"
            gap="$2"
            flexWrap="wrap"
            width="100%"
            flexDirection={isWeb ? "row" : "row"}
          >
            {exampleProjects.map((project, index) => (
              <ProjectExampleChip 
                key={index}
                title={project.title} 
                onPress={() => handleExampleProjectPress(index)} 
                isDark={isDark}
                index={index}
              />
            ))}
          </XStack>
        </YStack>

        <Text color={isDark ? "#666" : "#999"} fontSize="$3" textAlign="center" fontFamily="$body" mt="$4">
          Or click the + icon below to create your own!
        </Text>
      </YStack>
    </XStack>
  )
}

export default ProjectEmpty;
