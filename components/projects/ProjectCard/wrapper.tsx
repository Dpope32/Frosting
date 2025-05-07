import React from 'react'
import { XStack, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Check } from '@tamagui/lucide-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import Animated, { FadeIn } from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { isWeb } from 'tamagui'

interface ProjectCardWrapperProps {
  project: Project
  isDark: boolean
  priorityColor: string
  onEdit?: (projectId: string) => void
  children: React.ReactNode
}

// Helper function for border color
const borderColor = (project: Project, isDark: boolean) => {
  if (project.tasks && project.tasks.length == 0) {
    return isDark ? '#222' : '#ccc'
  }
  return 'transparent'
}

export const ProjectCardWrapper = ({ project, isDark, priorityColor, onEdit, children }: ProjectCardWrapperProps) => {
  return (
    <Animated.View
      entering={FadeIn.duration(600)}
      style={{
        width: isIpad() ? '95%' : '100%',
        borderRadius: 12,
        marginBottom: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        marginHorizontal: isIpad() ? 16 : 0,
        shadowOpacity: 0.5,
        shadowRadius: 8,
        elevation: 10,
        overflow: 'hidden',
        position: 'relative',
        borderTopWidth: project.status === 'completed' ? 0 : 2,
        borderRightWidth: project.status === 'completed' ? 0 : 2,
        borderBottomWidth: project.status === 'completed' ? 0 : 2,
        borderLeftWidth: project.status === 'completed' ? 0 : 3,
        borderTopColor: isDark ? '#333' : '#e0e0e0',
        borderRightColor: isDark ? '#333' : '#e0e0e0',
        borderBottomColor: isDark ? '#333' : '#e0e0e0',
        borderLeftColor: project.status === 'completed' ? 'transparent' : priorityColor,
        backgroundColor: isDark ? "rgba(22, 22, 22, 0.3)" : "rgba(255, 255, 255, 0.7)",
        ...(isWeb ? {} : {
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.5,
          shadowRadius: 8,
          elevation: 10,
        })
      }}
    >
      {project.status === 'completed' && (
        <XStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg={isDark ? 'rgba(0,0,0,0.95)' : 'rgba(0,0,0,0.7)'}
          zIndex={20}
          ai="center"
          jc="center"
          br={12}
        >
          <XStack
            bg="transparent"
            borderWidth={1}
            borderColor={isDark ? '#00ff00' : '#00ff00'}
            width={50}
            height={50}
            br={25}
            ai="center"
            jc="center"
            opacity={0.9}
          >
            <Check size={30} color="#00ff00" />
          </XStack>
        </XStack>
      )}
      
      {onEdit && (
        <Button
          size="$2"
          circular
          backgroundColor="transparent"
          onPress={() => onEdit(project.id)}
          position="absolute"
          top={isIpad() ? 14 : 12}
          right={isIpad() ? 16 : 14}
          zIndex={10}
        >
          <MaterialIcons name="edit" size={18} color={isDark ? '#696969' : '#667766'} />
        </Button>
      )}

      <LinearGradient
        colors={isDark ? ['rgb(0, 0, 0)', 'rgb(6, 6, 6)', 'rgb(12, 12, 12)', 'rgb(18, 18, 18)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0, bottom: 0,
          borderWidth: 2, borderRadius: 12,
          borderRightColor: borderColor(project, isDark),
          borderTopColor: borderColor(project, isDark),
          borderBottomColor: borderColor(project, isDark),
        }}
      />
      
      {children}
    </Animated.View>
  )
}
