import React from 'react'
import { XStack, YStack, Text, Button, isWeb } from 'tamagui'
import { MaterialIcons } from '@expo/vector-icons'
import { Check } from '@tamagui/lucide-icons'
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

const borderColor = (project: Project, isDark: boolean) => {
  if (project.tasks && project.tasks.length == 0) {
    return isDark ? '#222' : '#ccc';
  }
  return 'transparent';
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
            borderTopWidth: 2,
            borderRightWidth: 2,
            borderBottomWidth: 2,
            borderLeftWidth: project.status === 'completed' ? 0 : 3, 
            borderTopColor: isDark ? '#333' : '#e0e0e0',
            borderRightColor: isDark ? '#333' : '#e0e0e0',
            borderBottomColor: isDark ? '#333' : '#e0e0e0',
            borderLeftColor: project.status === 'completed' ?  'transparent' : priorityColor,
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
              bg={isDark ? 'rgba(0,0,0,0.9)' : 'rgba(0,0,0,0.7)'}
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
              <MaterialIcons name="edit" size={18} color={isDark ? '#f6f6f6' : '#667766'} />
            </Button>
          )}

          <LinearGradient
            colors={isDark ? ['rgb(0, 0, 0)',  'rgb(6, 6, 6)', 'rgb(12, 12, 12)', 'rgb(18, 18, 18)'] : ['rgba(255, 255, 255, 0.7)', 'rgba(238, 238, 238, 0.7)']} 
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0.5 }}
            style={{ position: 'absolute', 
              top: 0, left: 0, right: 0, bottom: 0, 
              borderWidth: 2, borderRadius: 12, 
                borderRightColor: borderColor(project, isDark),
                borderTopColor: borderColor(project, isDark),
                borderBottomColor: borderColor(project, isDark),
              }}
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
            pt={isIpad() ? "$2" : "$1"}
          >
            <YStack flex={1} gap="$2"> 
              <XStack px={isIpad() ? "$2" : "$1"} ai="center" py={isIpad() ? "$1.5" : "$1"} mt={isIpad() ? "$-1" : 6} ml={6}>
                <XStack ai="center" gap="$2" flexWrap="wrap" f={1}>
                  <Text color={isDark ? '#f6f6f6' : '#111'} fontSize={isIpad() ? 18 : 16}  fontWeight="bold" fontFamily="$body">
                    {project.name}
                  </Text>
                  <MaterialIcons name="circle" size={12} color={priorityColor} />
                </XStack>
              </XStack>
              <XStack ai="center" px={isIpad() ? "$3" : "$3"} my={-4}> 
                {project?.tags && Array.isArray(project.tags) && project.tags.length > 0 ? (
                  <>
                    <XStack ai="center">
                      {project.tags.map((tag, index) => (
                        <XStack
                          key={tag.id}
                          alignItems="center"
                          backgroundColor={`${tagColors[index % tagColors.length]}15`}
                          px="$1"
                          py="$0.5"
                          br={12}
                          opacity={0.9}
                          mr={4}
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
                          ml={0}
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
                            fontSize={isIpad() ? 13 : 11}
                            fontFamily="$body"
                          >
                            {project.status.replace('_', ' ')}
                          </Text>
                        </XStack>
                      )}
                    </XStack>
                  </>
                ) : (
                  project?.status && (
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
                      ml={0}
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
                        fontSize={isIpad() ? 13 : 11}
                        fontFamily="$body"
                      >
                        {project.status.replace('_', ' ')}
                      </Text>
                    </XStack>
                  )
                )}
              </XStack>
                 <YStack
                   minWidth={isIpad() ? 380 : 240}
                   p={isIpad() ? '$4' : '$3'}
                   pt={isIpad() ? '$2' : '$1'}
                   ml={0}
                   mr={0}
                 >
                   <ProjectCardDetails project={project} isDark={isDark} onEdit={onEdit} />
                   {project.tasks && project.tasks.length > 0 && (
                     <>
                       <XStack w="100%" h={1} bg={isDark ? '#555555' : '#ccc'} opacity={0.18} my={isIpad() ? 18 : 12} />
                       {project.tasks.length > 1 && (
                         <Text fontSize={12} color={isDark ? 'rgba(255, 255, 255, 0.84)' : 'rgba(0, 0, 0, 0.5)'} ml={0} mb={6} fontFamily="$body">
                           {project.tasks.filter(t => t.completed).length}/{project.tasks.length} completed
                         </Text>
                       )}
                       <XStack gap={8} flexWrap="wrap" ai="center" ml={0}>
                         {project.tasks.map((task, idx) => {
                           return (
                             <XStack
                               key={task.id}
                               ai="center"
                               px={8}
                               py={isIpad() ? 6 : 10}
                               br={10}
                               bg={getTaskBackgroundColor(task.priority as TaskPriority, task.completed, isDark)}
                               borderWidth={1}
                               borderColor={isDark ? '#333' : '#ddd'}
                               style={{
                                 opacity: task.completed ? 0.6 : 1,
                                 position: 'relative',
                                 marginBottom: 0,
                                 width: '100%',
                                 flexBasis: '100%',
                               }}
                             >
                               <Button
                                 size="$1"
                                 circular
                                 bg={task.completed
                                   ? (isDark ? 'transparent' : '#e0e0e0')
                                   : (isDark ? '#222' : '#f5f5f5')}
                                 borderWidth={1}
                                 borderColor={isDark ? 'transparent' : '#bbb'}
                                 onPress={() => onToggleTaskCompleted && onToggleTaskCompleted(task.id, !task.completed)}
                                 mr={8}
                                 ai="center"
                                 jc="center"
                                 style={{ width: 24, height: 24 }}
                               >
                                 {task.completed ? <Check size={16} color={isDark ? '#00ff00' : '#00ff00'} /> : ''}
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
                     </>
                   )}
                   {onOpenAddTaskModal && (
                     <XStack w="100%" flexBasis="100%" jc="flex-end" px={0} mt={isIpad() ? 18 : 12} mb={0}>
                       <Button
                         size="$2"
                         circular
                         backgroundColor="transparent"
                         onPress={() => onOpenAddTaskModal(project.id)}
                         ai="center"
                         jc="center"
                       >
                         <Plus size={20} color={isDark ? '#f6f6f6' : '#111'} />
                       </Button>
                     </XStack>
                   )}
                 </YStack>
            </YStack>
          </XStack>
        </Animated.View>
    )
}


export default ProjectCardMobile;
