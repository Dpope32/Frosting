import React, { useState } from 'react'
import { XStack, YStack, Text, Button } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types'
import { ProjectCardHeader, TaskListItem ,getDaysUntilDeadline } from './'
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

  const hasDescription = project?.description && project.description !== 'No description';
  const hasDeadline = !!project?.deadline;
  const hasTasks = project.tasks?.length > 0;
  const hasContent = hasDescription || hasDeadline;
  
  return (
    <YStack
      bg={isDark ? '#111' : '#f5f5f5'}
      px="$4"
      pt="$2"
      pb="$3"
      br="$4"
      animation="quick"
      width="100%"
      minHeight={hasTasks && project.tasks.length > 4 ? 380 : hasContent || hasTasks ? 320 : 220}
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
      
      {/* Header with title and status */}
      <XStack jc="space-between" ai="center" mt="$3" mb="$3">
        <XStack ai="center" gap="$2" f={1} flexWrap="wrap">
          <Text 
            color={isDark ? '#f6f6f6' : '#222'} 
            fontSize="$5" 
            fontWeight="bold"   
            fontFamily="$body"
          >
            {project.name}
          </Text>
          {project.deadline && (() => {
            let d: Date | undefined;
            if (typeof project.deadline === 'string') d = new Date(project.deadline);
            else if (project.deadline instanceof Date) d = project.deadline;
            if (!d || isNaN(d.getTime())) return null;
            return (
              <XStack ai="center" gap="$1">
                <MaterialIcons name="event" size={16} color={isDark ? '#999' : '#999'} />
                <Text fontSize={12} color={isDark ? '#f6f6f6' : '#222'} fontFamily="$body">
                  {d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </Text>
              </XStack>
            );
          })()}
        </XStack>
        
        {/* Edit button */}
        {onEdit && (
          <Button
            size="$2"
            circular
            backgroundColor="transparent"
            onPress={() => onEdit(project.id)}
            pressStyle={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)',
              scale: 0.95,
            }}
            hoverStyle={{
              backgroundColor: isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.15)',
            }}
          >
            <MaterialIcons 
              name="edit" 
              size={18} 
              color={isDark ? '#d0d0d0' : '#666'} 
            />
          </Button>
        )}
      </XStack>

      {/* Description and Deadline - only show if they exist */}
      {hasContent && (
        <YStack gap="$2" mb="$3" mx="$2">
          {hasDescription && (
            <XStack ai="flex-start" gap="$2">
              <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" fontWeight="600" fontFamily="$body" minWidth={80}>
                Description:
              </Text>
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body" lineHeight="$1">
                {project.description}
              </Text>
            </XStack>
          )}

          {hasDeadline && (
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
      )}

      {/* Tasks section */}
      {hasTasks && (
        <YStack mx="$2" mt="$2">
          <XStack w="100%" h={1} bg={isDark ? '#222' : '#ddd'} opacity={0.7} my="$2" />
          {project.tasks.length > 1 && (
            <Text fontSize="$3" color={isDark ? '#aaa' : '#555'} mb="$2" fontFamily="$body">
              {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
            </Text>
          )}
          <YStack 
            maxHeight={300} 
            style={{ 
              overflowY: 'auto',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none'
            } as any}
            className="hide-scrollbar"
          >
            {project.tasks.length > 1 ? (
              // Multi-column layout for 2 or more tasks using flexbox
              <XStack 
                gap="$2" 
                ai="flex-start" 
                jc="flex-start"
                flexWrap="wrap"
                width="100%"
              >
                {project.tasks.map((task, index) => (
                  <YStack 
                    key={task.id} 
                    width="calc(50% - 4px)" 
                    minWidth="240px"
                    maxWidth="calc(50% - 4px)"
                    mb="$1"
                  >
                    <TaskListItem
                      task={task}
                      isDark={isDark}
                      onToggleTaskCompleted={onToggleTaskCompleted}
                    />
                  </YStack>
                ))}
              </XStack>
            ) : (
              // Single column layout for single task
              <YStack gap="$1">
                {project.tasks.map((task) => (
                  <TaskListItem
                    key={task.id}
                    task={task}
                    isDark={isDark}
                    onToggleTaskCompleted={onToggleTaskCompleted}
                  />
                ))}
              </YStack>
            )}
          </YStack>
        </YStack>
      )}

      {/* Add task section - better positioned */}
      {onOpenAddTaskModal && (
        <YStack 
          mx="$2" 
          mt={hasTasks ? "$3" : hasContent ? "$2" : "$4"} 
          gap="$2"
        >
          {!hasTasks && (
            <XStack jc="flex-start" ai="center" mb="$2">
              <Text 
                color={isDark ? 'rgba(246, 246, 246, 0.6)' : 'rgba(102, 102, 102, 0.8)'} 
                fontSize="$3" 
                fontFamily="$body"
              >
                Add your first task to get started
              </Text>
            </XStack>
          )}
          
          <XStack jc="flex-start" ai="center">
            <Button
              size="$3"
              circular
              backgroundColor={isDark ? 'rgba(34, 34, 34, 0.8)' : 'rgba(245, 245, 245, 0.9)'}
              borderColor={isDark ? 'rgba(60, 60, 60, 0.6)' : 'rgba(200, 200, 200, 0.6)'}
              borderWidth={1}
              onPress={() => onOpenAddTaskModal(project.id)}
              pressStyle={{
                backgroundColor: isDark ? 'rgba(50, 50, 50, 1)' : 'rgba(230, 230, 230, 1)',
                borderColor: primaryColor,
                scale: 0.95,
              }}
              hoverStyle={{
                backgroundColor: isDark ? 'rgba(40, 40, 40, 1)' : 'rgba(240, 240, 240, 1)',
                borderColor: primaryColor,
              }}
            >
              <MaterialIcons 
                name="add" 
                size={20} 
                color={isDark ? '#d0d0d0' : '#555'} 
              />
            </Button>
          </XStack>
        </YStack>
      )}
    </YStack>
  )
}
