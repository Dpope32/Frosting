import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Project } from '@/types/project'
import { isIpad } from '@/utils/deviceUtils'
import { Plus } from '@tamagui/lucide-icons'
import { useTagStore } from '@/store/TagStore'
import Animated, { FadeIn } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { tagColors } from '@/utils/styleUtils';

interface ProjectCardProps {
  project: Project
  isDark: boolean
  primaryColor: string
}

const columnWidthWeb = isWeb ? 300 : isIpad() ? 200 : 100

// Helper to get priority color
const getPriorityColor = (priority: Project['priority']) => {
  switch (priority) {
    case 'high':
      return 'red';
    case 'medium':
      return 'orange';
    case 'low':
      return 'green';
    default:
      return 'gray';
  }
};

// Helper to calculate days until deadline
const getDaysUntilDeadline = (deadline?: Date): number | null => {
  if (!deadline || typeof deadline.getTime !== 'function') return null;
  
  const today = new Date();
  // Reset time to compare just dates
  today.setHours(0, 0, 0, 0);
  
  const deadlineDate = new Date(deadline);
  deadlineDate.setHours(0, 0, 0, 0);
  
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

export const ProjectCard = ({ project, isDark, primaryColor }: ProjectCardProps) => {
    const tags = useTagStore((state) => state.tags)
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
          height={120}
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
                    <Text color={isDark ? '#f6f6f6' : '#333'} fontSize="$2" fontFamily="$body">
                      {project.status}
                    </Text>
                  </XStack>
                )}

                {project?.deadline && typeof project.deadline.toLocaleDateString === 'function' && (
                  <XStack ai="center" gap="$1">
                    <MaterialIcons name="event" size={12} color={isDark ? '#999' : '#666'} />
                    <Text color={isDark ? '#ccc' : '#666'} fontSize="$2" fontFamily="$body">
                      {project.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </Text>
                  </XStack>
                )}
              </XStack>
              <Button size="$2" circular>
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
                    const daysLeft = getDaysUntilDeadline(project?.deadline);
                    if (daysLeft === null) return 'Not set';
                    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
                    if (daysLeft === 0) return 'Due today';
                    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'} remaining`;
                  })()}
                </Text>
              </XStack>
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
            padding: 16,
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
            colors={isDark ? ['rgba(34, 34, 34, 0.7)', 'rgba(0, 0, 0, 0.7)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']} // Adjusted opacity
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0}}
          />
          <XStack
            p={isIpad() ? "$3" : "$2"} 
            px={isWeb ? "$4" : isIpad() ? "$3" : "$4"} 
            pl={isWeb ? "$4" : isIpad() ? "$3" : "$4"} 
            br="$4"
            w={isIpad() ? "100%" : "100%"}
            ai="center"
            animation="quick"
            py={isIpad() ? "$3" : "$2.5"}
            pt={isIpad() ? "$3" : "$3"}
          >
            <YStack flex={1} gap="$2"> 
              <XStack jc="space-between" px={isIpad() ? "$2" : "$1"} ai="center" mt={isIpad() ? "$-1" : 0}>
                <XStack ai="center" gap="$3" f={1} flexWrap="wrap">
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize="$4" fontWeight="bold" fontFamily="$body">
                    {project.name}
                  </Text>
                  <MaterialIcons name="circle" size={12} color={priorityColor} />

                  {project?.deadline && typeof project.deadline.toLocaleDateString === 'function' && (
                    <XStack ai="center" gap="$1">
                      <MaterialIcons name="event" size={16} color={isDark ? '#999' : '#666'} />
                      <Text color={isDark ? '#ccc' : '#444'} fontSize={isIpad() ? 15 : 13} paddingHorizontal={4} fontFamily="$body">
                        {project.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </Text>
                    </XStack>
                  )}
                </XStack>

                <Button size="$2" circular onPress={() => console.log('Add task clicked for', project.name)}>
                  <Plus size={16} />
                </Button>

              </XStack>
              <XStack ai="center" gap="$1" flexWrap="wrap" px={isIpad() ? "$2" : "$1"}> 
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
              
              <YStack ml={isIpad() ? 16 : 0} gap="$1"> 
              <XStack ai="flex-start"  gap="$2" my="$2" px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 80} fontFamily="$body">
                  Description:
                </Text>
                <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? "$4" : "$3"} flex={1} fontFamily="$body">
                  {project?.description || 'No description'}
                </Text>
              </XStack>

              <XStack ai="center" gap={"$2"} mb="$2" px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 80} fontFamily="$body">
                  Created:
                </Text>
                <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? "$4" : "$3"} flex={1} fontFamily="$body">
                  {project?.createdAt && typeof project.createdAt.toLocaleDateString === 'function'
                    ? project.createdAt.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
                    : 'Not set'}
                </Text>
              </XStack>

              <XStack ai="center" gap={"$2"} mb="$2" px={isIpad() ? "$2" : "$2"}>
                <Text color={isDark ? '#666' : '#666'} fontSize={isIpad() ? "$4" : "$3"} w={isIpad() ? 150 : 90} fontFamily="$body">
                 Days remaining:
                </Text>
                <Text
                  color={isDark ? '#f6f6f6' : '#111'}
                  fontSize={isIpad() ? "$4" : "$3"}
                  flex={1}
                  fontFamily="$body"
                >
                  {(() => {
                    const daysLeft = getDaysUntilDeadline(project?.deadline);
                    if (daysLeft === null) return 'Not set';
                    if (daysLeft < 0) return `${Math.abs(daysLeft)} days overdue`;
                    if (daysLeft === 0) return 'Due today';
                    return `${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`;
                  })()}
                </Text>
              </XStack>
              </YStack>
            </YStack>
          </XStack>
        </Animated.View>
      )
}

export default ProjectCard;
