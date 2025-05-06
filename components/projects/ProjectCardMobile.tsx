import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { getPriorityColor } from '@/utils/styleUtils'
import { Plus } from '@tamagui/lucide-icons'
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { tagColors } from '@/utils/styleUtils';
import { TaskPriority } from '@/types/task';
import { getTaskBackgroundColor } from './ProjectCard/projectCardUtils';
import { ProjectCardDetails } from './ProjectCard/details';

interface ProjectCardMobileProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
  onEdit?: (projectId: string) => void;
}

export const ProjectCardMobile = ({ project, isDark, primaryColor, onOpenAddTaskModal, onToggleTaskCompleted, onEdit }: ProjectCardMobileProps) => {
    const priorityColor = getPriorityColor(project.priority);
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
            borderLeftWidth: 3, 
            borderLeftColor: priorityColor,
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
          <LinearGradient
            colors={isDark ? ['rgb(0, 0, 0)',  'rgb(11, 11, 11)', 'rgb(20, 19, 19)', 'rgb(30, 30, 30)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 2, borderRadius: 12, borderColor: project.tasks.length > 0 ? isDark ? '#222' : 'transparent' : 'transparent'}}
          />
          <XStack
            p={isIpad() ? "$3" : "$2"} 
            px={isWeb ? "$4" : isIpad() ? "$3" : "$3"} 
            pl={isWeb ? "$4" : isIpad() ? "$3" : "$2.5"} 
            br="$4"
            w={isIpad() ? "100%" : "100%"}
            ai="center"
            animation="quick"
            py={isIpad() ? "$3" : "$2.5"}
            pt={isIpad() ? "$3" : "$2.5"}
            borderBottomWidth={project.tasks.length > 0 ? 1 : 0}
            borderBottomColor={isDark ? '#444' : '#ddd'}
          >
            <YStack flex={1} gap="$2"> 
              <XStack jc="space-between" px={isIpad() ? "$2" : "$1"} ai="center" py={isIpad() ? "$1.5" : "$1"} mt={isIpad() ? "$-1" : 0} ml={6}>
                <XStack ai="center" gap="$2" f={1} flexWrap="wrap">
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? 18 : 16}  fontWeight="bold" fontFamily="$body">
                    {project.name}
                  </Text>
                  <MaterialIcons name="circle" size={12} color={priorityColor} />
                   {project?.status && (
                      <XStack
                        bg={
                          project.status === 'completed'
                            ? 'rgba(0, 128, 0, 0.1)'
                            : project.status === 'in_progress'
                            ? 'rgba(0, 0, 255, 0.1)'
                            : project.status === 'pending'
                            ? 'rgba(255, 255, 0, 0.1)'
                            : project.status === 'past_deadline'
                            ? 'rgba(255, 0, 0, 0.1)'
                            : (isDark ? 'rgba(113, 148, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)')
                        }
                        py="$0.5"
                        br={12}
                        opacity={0.8}
                        ai="center"
                      >
                        <Text
                          paddingHorizontal={"$1.5"}
                          paddingVertical={"$0.5"}
                          color={
                            project.status === 'completed'
                              ? '$green10'
                              : project.status === 'in_progress'
                              ? '$blue10'
                              : project.status === 'pending'
                              ? '$yellow10'
                              : project.status === 'past_deadline'
                              ? '$red10'
                              : (isDark ? '$blue10' : '#333')
                          }
                          fontSize={isIpad() ? 15 : 13}
                          fontFamily="$body"
                        >
                          {project.status.replace('_', ' ')}
                        </Text>
                      </XStack>
                    )}
                  {project?.deadline && (() => {
                      let deadlineDate = project.deadline;
                      if (typeof deadlineDate === 'string') deadlineDate = new Date(deadlineDate);
                      if (deadlineDate instanceof Date && !isNaN(deadlineDate.getTime())) {
                        return (
                          <XStack ai="center" gap="$1">
                            <MaterialIcons name="event" size={16} color={isDark ? '#999' : '#666'} />
                            <Text color={isDark ? '#ccc' : '#444'} fontSize={isIpad() ? 15 : 13} paddingHorizontal={4} fontFamily="$body">
                              {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </Text>
                          </XStack>
                        );
                      }
                      return null;
                    })()}
                </XStack>

                <Button size="$2" circular backgroundColor="transparent" onPress={() => onOpenAddTaskModal && onOpenAddTaskModal(project.id)}>
                  <Plus size={16} color={isDark ? '#f6f6f6' : '#111'} />
                </Button>

              </XStack>
              <XStack ai="center" gap="$1" flexWrap="wrap" px={isIpad() ? "$2" : "$1"} my={-6}> 
                {project?.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
                    <XStack flex={1} flexWrap="wrap" gap="$1">
                      {project.tags.map((tag, index) => (
                        <XStack
                          key={tag.id}
                          alignItems="center"
                          backgroundColor={`${tagColors[index % tagColors.length]}15`}
                          px="$1"
                          py="$0.5"
                          br={12}
                          opacity={0.9}
                        >
                          <Text
                            fontFamily="$body"
                            color={tagColors[index % tagColors.length]}
                            fontSize={isIpad() ? 15 : 13} 
                            fontWeight="500"
                            paddingHorizontal={4}
                          >
                            {tag.name.toLowerCase()}
                          </Text>
                        </XStack>
                      ))}
                    </XStack>
                  )}
                </XStack>
                 <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
            </YStack>
          </XStack>

          {project.tasks && project.tasks.length > 0 && (
            <>
              <YStack pl={isWeb ? '$4' : '$3'} pb={12}>
                <XStack w="100%" h={1} bg={isDark ? '#555555' : '#ccc'} opacity={0.0} mb={6} />
                  {project.tasks.length > 1 && (
                    <Text fontSize={12} color={isDark ? 'rgba(255, 255, 255, 0.84)' : 'rgba(0, 0, 0, 0.5)'} ml={4} mb={6} fontFamily="$body">
                      {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                    </Text>
                  )}
                <XStack gap={2} flexWrap="wrap">
                  {project.tasks.map((task, idx) => {
                    return (
                      <XStack
                        key={task.id}
                        ai="center"
                        px={8}
                        py={4}
                        br={10}
                        bg={getTaskBackgroundColor(task.priority as TaskPriority, task.completed, isDark)}
                        style={{
                          opacity: task.completed ? 0.6 : 1,
                          position: 'relative',
                          marginBottom: 0,
                          width: '48%',
                          flexBasis: '48%',
                        }}
                      >
                        <Button
                          size="$1"
                          circular
                          bg={task.completed ? '$green8' : '$gray4'}
                          onPress={() => onToggleTaskCompleted && onToggleTaskCompleted(task.id, !task.completed)}
                          mr={8}
                          ai="center"
                          jc="center"
                          style={{ width: 24, height: 24 }}
                        >
                          {task.completed ? '✓' : ''}
                        </Button>
                        <Text
                          fontSize={13}
                          color={isDark ? '#f6f6f6' : '#222'}
                          fontFamily="$body"
                          style={{ flex: 1, marginLeft: 2, textDecorationLine: task.completed ? 'line-through' : 'none', whiteSpace: 'normal' }}
                        >
                          {task.name}
                        </Text>
                        <XStack ml={10} ai="center">
                          <Text style={{ fontSize: isWeb ? 22 : 28, color: getPriorityColor(task.priority), lineHeight: isWeb ? 22 : 28 }}>•</Text>
                        </XStack>
                        {task.completed && (
                          <XStack
                            position="absolute"
                            top={0}
                            left={0}
                            right={0}
                            bottom={0}
                            bg={isDark ? 'rgba(0,0,0,0.18)' : 'rgba(255,255,255,0.18)'}
                            zIndex={1}
                            br={10}
                            pointerEvents="none"
                          />
                        )}
                      </XStack>
                    );
                  })}
                </XStack>
              </YStack>
            </>
          )}
        </Animated.View>
    )
}


export default ProjectCardMobile;
