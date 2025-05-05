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

interface ProjectCardProps {
  project: Project
  isDark: boolean
  primaryColor: string
  onOpenAddTaskModal?: (projectId: string) => void;
  onToggleTaskCompleted?: (taskId: string, completed: boolean) => void;
}

const columnWidthWeb = isWeb ? 300 : isIpad() ? 200 : 100

const getDaysUntilDeadline = (deadline?: Date): number | null => {
  if (!deadline || typeof deadline.getTime !== 'function') return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
};

export const ProjectCard = ({ project, isDark, primaryColor, onOpenAddTaskModal, onToggleTaskCompleted }: ProjectCardProps) => {
    const priorityColor = getPriorityColor(project.priority);

    return isWeb ? (
        <XStack
          bg={isDark ? '#111' : '#f5f5f5'}
          px="$4"
          br="$4"
          ai="center"
          animation="quick"
          width={columnWidthWeb}
          minWidth={288}
          maxWidth={400}
          minHeight={120}
          hoverStyle={{
            transform: [{ scale: 1.02 }],
            borderColor: primaryColor,
            shadowColor: primaryColor,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
          }}
        >
          <YStack flex={1}>
            <XStack jc="space-between" ai="center" mt="$1" mb="$2">
              <XStack ai="center" gap="$2" f={1} flexWrap="wrap">
                <Text color={isDark ? '#f6f6f6' : '#222'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                  {project.name}
                </Text>
                <MaterialIcons name="circle" size={12} color={priorityColor} />

                {project?.status && (
                  <XStack
                    bg={isDark ? '#222' : '#eee'}
                    px="$1.5"
                    py="$0.5"
                    br="$4"
                    borderWidth={0.5}
                    borderColor={isDark ? '#444' : '#ddd'}
                    ai="center"
                  >
                    <Text color={project.status === 'pending' ? '$blue10' : project.status === 'in_progress' ? '$yellow10' : '$green10'} fontSize="$2" fontFamily="$body">
                      {project.status}
                    </Text>
                  </XStack>
                )}

                {project?.deadline && (() => {
                  let deadlineDate = project.deadline;
                  if (typeof deadlineDate === 'string') deadlineDate = new Date(deadlineDate);
                  if (deadlineDate instanceof Date && !isNaN(deadlineDate.getTime())) {
                    return (
                      <XStack ai="center" gap="$1">
                        <MaterialIcons name="event" size={12} color={isDark ? '#999' : '#666'} />
                        <Text color={isDark ? '#ccc' : '#666'} fontSize="$2" fontFamily="$body">
                          {deadlineDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </Text>
                      </XStack>
                    );
                  }
                  return null;
                })()}
              </XStack>
              <Button size="$2" circular onPress={() => onOpenAddTaskModal && onOpenAddTaskModal(project.id)}>
                <Plus size={16} />
              </Button>
            </XStack>

            <XStack ai="center" gap={ "$2"} mb="$2">
              {!isIpad() && (
                <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                  Description:
                </Text>
              )}
              <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                {project?.description || 'No description'}
              </Text>
            </XStack>

            {project?.deadline && (
              <XStack ai="center" gap="$2" mb="$2">
                {!isIpad() && (
                  <Text color={isDark ? '#ccc' : '#666'} fontSize="$3" w={70} fontFamily="$body">
                    Deadline:
                  </Text>
                )}
                <Text color={isDark ? '#f6f6f6' : '#000'} fontSize="$3" flex={1} fontFamily="$body">
                  {(() => {
                    let deadlineDate = project?.deadline;
                    if (!deadlineDate) return '-';
                    if (typeof deadlineDate === 'string') deadlineDate = new Date(deadlineDate);
                    if (!(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime())) return '-';
                    const daysLeft = getDaysUntilDeadline(deadlineDate);
                    if (daysLeft === null) return '-';
                    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
                    if (daysLeft === 0) return 'Due today';
                    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
                  })()}
                </Text>
              </XStack>
            )}

            {project.tasks && project.tasks.length > 0 && (
              <>
                <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={8} mt={8} />
                <YStack pl={isWeb ? '$4' : '$3'}>
                  <XStack w="100%" h={1} bg={isDark ? '#222' : '#ccc'} opacity={0.5} mb={8} />
                  {project.tasks.length > 1 && (
                    <Text fontSize={12} color={isDark ? '#aaa' : '#444'} mb={2} fontFamily="$body">
                      {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                    </Text>
                  )}
                  <XStack gap={12} flexWrap="wrap">
                    {project.tasks.map((task, idx) => {
                      return (
                        <XStack
                          key={task.id}
                          ai="center"
                          px={8}
                          py={4}
                          br={10}
                          bg={isDark ? '#111' : '#999'}
                          borderWidth={1}
                          borderColor={isDark ? '#444' : '#ddd'}
                          style={{
                            opacity: task.completed ? 0.6 : 1,
                            position: 'relative',
                            marginBottom: 0,
                            width: '48%',
                            minWidth: 120,
                            maxWidth: 300,
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
                            <Text style={{ fontSize: 22, color: getPriorityColor(task.priority), lineHeight: 22 }}>•</Text>
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
                            />
                          )}
                        </XStack>
                      );
                    })}
                  </XStack>
                </YStack>
              </>
            )}

          </YStack>
        </XStack>
      ) : (
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
            colors={isDark ? ['rgba(91, 91, 91, 0.7)',  'rgba(0, 0, 0, 0.7)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']} // Adjusted opacity
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, borderWidth: 1, borderColor: isDark ? '#444' : '#ddd'}}
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
          >
            <YStack flex={1} gap="$2"> 
              <XStack jc="space-between" px={isIpad() ? "$2" : "$1"} ai="center" mt={isIpad() ? "$-1" : 0}>
                <XStack ai="center" gap="$3" f={1} flexWrap="wrap">
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                    {project.name}
                  </Text>
                  <MaterialIcons name="circle" size={12} color={priorityColor} />

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

                <Button size="$2" circular onPress={() => onOpenAddTaskModal && onOpenAddTaskModal(project.id)}>
                  <Plus size={16} />
                </Button>

              </XStack>
              <XStack ai="center" gap="$1" flexWrap="wrap" px={isIpad() ? "$2" : "$1"} my={-6}> 
                {project?.status && (
                      <XStack
                        bg={isDark ? 'rgba(113, 148, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'} 
                        px="$1" 
                        py="$0.5" 
                        br={12} 
                        borderWidth={0.5}
                        borderColor={isDark ? '#444' : '#ddd'}
                        opacity={0.8}
                        ai="center"
                      >
                        <Text paddingHorizontal={4} color={isDark ? '$blue10' : '#333'} fontSize={isIpad() ? 15 : 13} fontFamily="$body"> 
                          {project.status}
                        </Text>
                      </XStack>
                    )}
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
              
              <YStack ml={isIpad() ? 16 : 0} gap="$1"  px={"$2"} pb={"$2"} mt={"$2"} br={"$2"} backgroundColor={isDark? 'rgba(255, 255, 255, 0.0)' : 'rgba(28, 27, 27, 0.1)'}> 
              <XStack ai="flex-start"  gap="$2" my="$2" px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#999' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 110} fontFamily="$body">
                  Description:
                </Text>
                <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? "$4" : "$3"} flex={1} fontFamily="$body">
                  {project?.description || 'No description'}
                </Text>
              </XStack>

              <XStack ai="center" gap={"$2"} mb="$2" px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#999' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 110} fontFamily="$body">
                  Created:
                </Text>
                <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? "$4" : "$3"} flex={1} fontFamily="$body">
                  {(() => {
                    let dateObj = project?.createdAt;
                    if (dateObj && typeof dateObj === 'string') {
                      dateObj = new Date(dateObj);
                    }
                    if (dateObj && dateObj instanceof Date && !isNaN(dateObj.getTime())) {
                      return dateObj.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                    }
                    return '-';
                  })()}
                </Text>
              </XStack>

              <XStack ai="center" gap={"$2"} px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#999' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 110} fontFamily="$body">
                  Days remaining:
                </Text>
                <Text
                  color={isDark ? '#f6f6f6' : '#111'}
                  fontSize={isIpad() ? "$4" : "$3"}
                  flex={1}
                  fontFamily="$body"
                >
                  {(() => {
                    let deadlineDate = project?.deadline;
                    if (!deadlineDate) return '-';
                    if (typeof deadlineDate === 'string') deadlineDate = new Date(deadlineDate);
                    if (!(deadlineDate instanceof Date) || isNaN(deadlineDate.getTime())) return '-';
                    const daysLeft = getDaysUntilDeadline(deadlineDate);
                    if (daysLeft === null) return '-';
                    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
                    if (daysLeft === 0) return 'Due today';
                    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
                  })()}
                </Text>
                
              </XStack>
              </YStack>
            </YStack>
          </XStack>

          {project.tasks && project.tasks.length > 0 && (
            <>
              <YStack pl={isWeb ? '$4' : '$3'} pb={12}>
                <XStack w="100%" h={1} bg={isDark ? '#555555' : '#ccc'} opacity={0.5} mb={8} />
                  {project.tasks.length > 1 && (
                    <Text fontSize={12} color={isDark ? '#aaa' : '#444'} ml={12} mb={2} fontFamily="$body">
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
                        bg={isDark ? '#151515' : '#999'}
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
                        {/* Priority dot */}
                        <XStack ml={10} ai="center">
                          <Text style={{ fontSize: 22, color: getPriorityColor(task.priority), lineHeight: 22 }}>•</Text>
                        </XStack>
                        {/* Overlay if completed */}
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

export default ProjectCard;
