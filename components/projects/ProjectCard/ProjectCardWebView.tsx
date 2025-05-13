import React, { useState } from 'react'
import { XStack, YStack, Text } from 'tamagui'
import { Check } from '@tamagui/lucide-icons'
import { Project } from '@/types/project'
import { ProjectAttachments } from './ProjectAttachments'
import { ProjectCardHeader } from './ProjectCardHeader'
import { TaskListItem } from './TaskListItem'
import { getDaysUntilDeadline } from './projectCardUtils'
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
    <XStack
      bg={isDark ? '#111' : '#f5f5f5'}
      px="$4"
      br="$4"
      ai="center"
      animation="quick"
      width={1300}
      minWidth={1300}
      marginTop={30}
      maxWidth={1100}
      borderWidth={4}
      borderColor={project.status === 'completed' ? '$green10' : project.status === 'in_progress' ? '$yellow10' : project.status === 'pending' ? '$orange10' : project.status === 'past_deadline' ? '$red10' : '$gray10'}
      minHeight={260}
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
              <Check size={30} color="white" />
            </XStack>
          </Animated.View>
        </Pressable>
      )}
      <YStack flex={1}>
        <ProjectCardHeader 
          project={project}
          isDark={isDark}
          onOpenAddTaskModal={onOpenAddTaskModal}
          isWeb={true}
        />

        <XStack ai="center" gap="$2" my="$2" ml={"$5"}>
          <Text color={isDark ? '#ccc' : '#666'} fontSize="$4" w={120} fontFamily="$body">
            Description:
          </Text>
          <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$4" flex={1} fontFamily="$body">
            {project?.description || 'No description'}
          </Text>
        </XStack>

        {project?.deadline && (
          <XStack ai="center" gap="$2" my="$2" ml="$5">
            <Text color={isDark ? '#ccc' : '#666'} fontSize="$4" w={120} fontFamily="$body">
              Deadline:
            </Text>
            <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$4" flex={1} fontFamily="$body">
              {getDaysUntilDeadline(project.deadline)}
            </Text>
          </XStack>
        )}

        {project.tasks?.length > 0 && (
          <>
            <YStack p="$4">
              <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={10} />
              {project.tasks.length > 1 && (
                <Text fontSize={16} color={isDark ? '#aaa' : '#444'} mb={2} fontFamily="$body">
                  {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                </Text>
              )}
              <XStack gap={12} flexWrap="wrap" mb={10} px={"$2"}>
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

        {project.attachments?.length > 0 && (
          <>
            <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={8} my={8} />
            <ProjectAttachments attachments={project.attachments} isDark={isDark} onImagePress={onImagePress} />
          </>
        )}
      </YStack>
    </XStack>
  )
}
