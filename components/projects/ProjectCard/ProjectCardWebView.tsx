import React, { useState } from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types'
import { ProjectAttachments, ProjectCardHeader, TaskListItem ,getDaysUntilDeadline } from './'
import { Pressable } from 'react-native'
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated'

interface ProjectCardWebViewProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void
  onEdit?: (projectId: string) => void
  onArchive?: (projectId: string) => void
  onImagePress?: (url: string) => void
  hideCompletedOverlay?: boolean
}

export const ProjectCardWebView = ({
  project,
  isDark,
  primaryColor,
  onOpenAddTaskModal,
  onToggleTaskCompleted,
  onEdit,
  onArchive,
  onImagePress,
  hideCompletedOverlay = false
}: ProjectCardWebViewProps) => {
  const [isPressed, setIsPressed] = useState(false);

  const handleLongPress = () => {
    if (project.status === 'completed') {
      setIsPressed(true);
      const confirmed = window.confirm('Do you want to archive this completed project?');
      if (confirmed && onArchive) {
        onArchive(project.id);
      }
      setIsPressed(false);
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: withTiming(isPressed ? 1.05 : 1, { duration: 200 }) }
      ]
    };
  });
  
  return (
    <YStack
      bg={isDark ? '#111' : '#f5f5f5'}
      px="$4"
      pt="$2"
      pb="$3"
      br="$4"
      animation="quick"
      width="100%"
      minHeight={300}
      borderWidth={2}
      borderColor={project.status === 'completed' ? '$green10' : project.status === 'in_progress' ? '$yellow10' : project.status === 'pending' ? '$orange10' : project.status === 'past_deadline' ? '$red10' : '$gray10'}
      position="relative"
      hoverStyle={{
        transform: [{ scale: 1.02 }],
        borderColor: primaryColor,
        shadowColor: primaryColor,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      }}
    >
      {project.status === 'completed' && !hideCompletedOverlay && (
        <Pressable
          onLongPress={handleLongPress}
          delayLongPress={600}
          style={{ 
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 20
          }}
        >
          <Animated.View
            style={[
              {
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(0,0,0,0.5)',
                borderRadius: 12,
                alignItems: 'center',
                justifyContent: 'center'
              },
              animatedStyle
            ]}
          >
            <XStack
              bg="$green9"
              width={50}
              height={50}
              br={25}
              ai="center"
              jc="center"
              opacity={0.9}
            >
              <MaterialIcons name="check" size={30} color="white" />
            </XStack>
          </Animated.View>
        </Pressable>
      )}
      
      <ProjectCardHeader 
        project={project}
        isDark={isDark}
        onOpenAddTaskModal={onOpenAddTaskModal}
        isWeb={true}
      />

      <YStack gap="$2" my="$2" mx="$6">
        <XStack ai="flex-start" gap="$2">
          <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" fontWeight="600" fontFamily="$body" minWidth={80}>
            Description:
          </Text>
          <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body" lineHeight="$1">
            {project?.description || 'No description'}
          </Text>
        </XStack>

        {project?.deadline && (
          <XStack ai="center" gap="$2">
            <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" fontWeight="600" fontFamily="$body" minWidth={80}>
              Deadline:
            </Text>
            <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
              {getDaysUntilDeadline(project.deadline)}
            </Text>
          </XStack>
        )}
      </YStack>

      {project.tasks?.length > 0 && (
        <YStack mx="$6" mt="$2">
          <XStack w="100%" h={1} bg={isDark ? '#222' : '#ddd'} opacity={0.7} my="$2" />
          {project.tasks.length > 1 && (
            <Text fontSize="$3" color={isDark ? '#aaa' : '#555'} mb="$2" fontFamily="$body">
              {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
            </Text>
          )}
          <YStack 
            gap="$1" 
            maxHeight={200} 
            style={{ 
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            } as any}
            className="hide-scrollbar"
          >
            {project.tasks.map((task) => (
              <TaskListItem
                key={task.id}
                task={task}
                isDark={isDark}
                onToggleTaskCompleted={onToggleTaskCompleted}
              />
            ))}
          </YStack>
        </YStack>
      )}

      {project.attachments?.length > 0 && (
        <YStack mx="$4" mt="$2">
          <XStack w="100%" h={1} bg={isDark ? '#222' : '#ddd'} opacity={0.7} my="$2" />
          <ProjectAttachments attachments={project.attachments} isDark={isDark} onImagePress={onImagePress} />
        </YStack>
      )}
    </YStack>
  )
}
