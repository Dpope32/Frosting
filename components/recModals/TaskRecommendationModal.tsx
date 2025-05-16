import React, { useState, useMemo, useRef, useCallback, useEffect } from 'react'
import { useColorScheme } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox, isWeb, Circle } from 'tamagui'
import { BaseCardModal } from '@/components/baseModals/BaseCardModal'
import { Ionicons, AntDesign } from '@expo/vector-icons'
import {  useRecommendationStore, useToastStore, useUserStore } from '@/store'
import { useProjectStore, useStoreTasks } from '@/store/ToDo'
import { 
  RecommendationCategory, 
  RecommendedTask, 
  getRecommendedTasks, 
  formatScheduleDays,
  getRecurrenceColor,
  getPriorityIcon,
  getPriorityColor
} from '@/constants/recommendations/TaskRecommendations'

// Global recommendation modal component
export function TaskRecommendationModal() {
  // Get state from the recommendation store
  const isOpen = useRecommendationStore(s => s.isOpen)
  const activeCategory = useRecommendationStore(s => s.activeCategory)
  const closeModal = useRecommendationStore(s => s.closeModal)
  // If no active category, don't render anything
  if (!activeCategory) {
    return null
  }
  
  return (
    <CategoryTaskModal 
      category={activeCategory}
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) closeModal()
      }}
    />
  )
}

// Individual category modal component
interface CategoryTaskModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: RecommendationCategory
}

function CategoryTaskModal({
  open,
  onOpenChange,
  category
}: CategoryTaskModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const addTask = useProjectStore(s => s.addTask)
  const existingTasks = useStoreTasks()
  const [selectedTasks, setSelectedTasks] = useState<Record<number, boolean>>({})
  const scrollViewRef = useRef<ScrollView>(null)
  const [showScrollToTop, setShowScrollToTop] = useState(false)

  // Reset state when modal is closed
  useEffect(() => {
    if (!open) {
      setSelectedTasks({});
    }
  }, [open]);

  const primaryColor = useUserStore((state) => state.preferences.primaryColor);

  const adjustColor = useCallback((color: string, amount: number) => {
    const hex = color.replace('#', '')
    const num = parseInt(hex, 16)
    const r = Math.min(255, Math.max(0, (num >> 16) + amount))
    const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00ff) + amount))
    const b = Math.min(255, Math.max(0, (num & 0x0000ff) + amount))
    return `#${(b | (g << 8) | (r << 16)).toString(16).padStart(6, '0')}`
  }, [])


  const handleToggleTask = (index: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  const showToast = useToastStore(s => s.showToast)
  
  const handleSaveSelectedTasks = () => {
    const allRecommendedTasks = getRecommendedTasks(category)
    const filteredTasks = filterOutExistingTasks(allRecommendedTasks)
    
    const selectedCount = Object.values(selectedTasks).filter(Boolean).length
    
    Object.entries(selectedTasks).forEach(([indexStr, isSelected]) => {
      if (isSelected) {
        const index = parseInt(indexStr)
        const task = filteredTasks[index]
        addTask({
          name: task.name,
          category: task.category,
          priority: task.priority,
          recurrencePattern: task.recurrencePattern,
          time: task.time || '',
          schedule: task.schedule
        })
      }
    })
    
    if (selectedCount > 0) {
      showToast(`${selectedCount} ${selectedCount === 1 ? 'task' : 'tasks'} added successfully!`, 'success')
    }
    
    setSelectedTasks({})
    onOpenChange(false)
  }

  const filterOutExistingTasks = (tasks: RecommendedTask[]): RecommendedTask[] => {
    const existingTaskNames = Object.values(existingTasks).map(task => task.name)
    return tasks.filter(task => !existingTaskNames.includes(task.name))
  }

  const recommendedTasks = useMemo(() => {
    return filterOutExistingTasks(getRecommendedTasks(category))
  }, [category, existingTasks])

  return (
    <BaseCardModal 
      open={open} 
      onOpenChange={(newOpen) => { onOpenChange(newOpen)}} 
      title={`${category} Tasks`}
      snapPoints={[isWeb? 90 : 90]}
      zIndex={200000}
      showCloseButton={true}
      hideHandle={true}
    >
      <YStack gap={isWeb ? "$4" : "$3"}paddingBottom={isWeb ? "$3" : "$8"} px={isWeb ? "$2" : "$1"}>
        <Text color={isDark ? "#dbd0c6" : "#666"} fontFamily="$body" fontSize={isWeb ? 16 : 14} opacity={0.9}> Select tasks to add to your schedule:</Text>
        
        <ScrollView 
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false} 
          bounces={false} 
          maxHeight="100%"
          onScroll={(event) => {
            const scrollY = event.nativeEvent.contentOffset.y;
            setShowScrollToTop(scrollY > 100);
          }}
          scrollEventThrottle={16}
        >
          {recommendedTasks.length === 0 ? (
            <YStack 
              backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
              br={12}
              padding="$4"
              borderWidth={1}
              borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
              alignItems="center"
              justifyContent="center"
              height={100}
            >
              <Text color={isDark ? "#dbd0c6" : "#666"} fontFamily="$body" fontSize={16}>
                All {category} tasks have been added
              </Text>
            </YStack>
          ) : isWeb ? (
            <XStack gap="$2">
              <YStack flex={1} gap="$2">
                {recommendedTasks
                  .filter((_, index) => index % 2 === 0)
                  .map((task, columnIndex) => {
                    const index = columnIndex * 2;
                    return (
                      <XStack 
                        key={index}
                        backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                        br={12}
                        padding="$4"
                        borderWidth={1}
                        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Checkbox
                          checked={selectedTasks[index] || false}
                          onCheckedChange={() => handleToggleTask(index)}
                          backgroundColor={selectedTasks[index] ? "#000" : "#F5F5DC"}
                          borderColor={selectedTasks[index] ? "#000" : "#D3D3D3"}
                          marginRight="$2"
                        >
                          {selectedTasks[index] && (
                            <Checkbox.Indicator>
                              <Ionicons name="checkmark" size={16} color="#00C851" />
                            </Checkbox.Indicator>
                          )}
                        </Checkbox>

                        <YStack flex={1} gap="$1" opacity={selectedTasks[index] ? 0.6 : 1}>
                          <XStack alignItems="center" gap="$2">
                            <Ionicons name={getPriorityIcon(task.priority)} size={16} color={getPriorityColor(task.priority)} />
                            <Text color={isDark ? "#fff" : "#000"} fontFamily="$body" fontSize={16} fontWeight="500"> {task.name} </Text>
                          </XStack>

                          <XStack gap="$2" alignItems="center" flexWrap="wrap">
                            <XStack backgroundColor={`${getRecurrenceColor(task.recurrencePattern)}20`} px="$2" py="$1" br={4} >
                              <Text fontFamily="$body" color={getRecurrenceColor(task.recurrencePattern)} fontSize={12} fontWeight="600">
                                {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                              </Text>
                            </XStack>

                            {task.time && ( <Text color={isDark ? "#999" : "#666"} fontSize={12}> {task.time} </Text>)}
                            {task.schedule.length > 0 && (<Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={12}> {formatScheduleDays(task.schedule)} </Text>)}
                          </XStack>
                        </YStack>
                      </XStack>
                    );
                  })}
              </YStack>

              <YStack flex={1} gap="$2">
                {recommendedTasks
                  .filter((_, index) => index % 2 === 1)
                  .map((task, columnIndex) => {
                    const index = columnIndex * 2 + 1;
                    return (
                      <XStack
                        key={index}
                        backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                        br={12}
                        padding="$4"
                        borderWidth={1}
                        borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Checkbox
                          checked={selectedTasks[index] || false}
                          onCheckedChange={() => handleToggleTask(index)}
                          backgroundColor={selectedTasks[index] ? "#000" : "#F5F5DC"}
                          borderColor={selectedTasks[index] ? "#000" : "#D3D3D3"}
                          marginRight="$2"
                        >
                          {selectedTasks[index] && (
                            <Checkbox.Indicator>
                              <Ionicons name="checkmark" size={16} color="#00C851" />
                            </Checkbox.Indicator>
                          )}
                        </Checkbox>

                        <YStack flex={1} gap="$1" opacity={selectedTasks[index] ? 0.6 : 1}>
                          <XStack alignItems="center" gap="$2">
                            <Ionicons name={getPriorityIcon(task.priority)} size={16} color={getPriorityColor(task.priority)} />
                            <Text color={isDark ? "#fff" : "#000"} fontFamily="$body" fontSize={16} fontWeight="500"> {task.name} </Text>
                          </XStack>

                          <XStack gap="$2" alignItems="center" flexWrap="wrap">
                            <XStack backgroundColor={`${getRecurrenceColor(task.recurrencePattern)}20`} px="$2" py="$1" br={4} >
                              <Text fontFamily="$body" color={getRecurrenceColor(task.recurrencePattern)} fontSize={12} fontWeight="600">
                                {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                              </Text>
                            </XStack>

                            {task.time && ( <Text color={isDark ? "#999" : "#666"} fontSize={12}> {task.time} </Text>)}
                            {task.schedule.length > 0 && (<Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={12}> {formatScheduleDays(task.schedule)} </Text>)}
                          </XStack>
                        </YStack>
                      </XStack>
                    );
                  })}
              </YStack>
            </XStack>
          ) : (
            <YStack gap={isWeb ? "$3" : "$1.5"}>
              {recommendedTasks.map((task, index) => (
                <XStack
                  key={index}
                  backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                  br={12}
                  padding="$3"
                  borderWidth={1}
                  borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                  alignItems="center"
                  justifyContent="space-between"
                  mb="$1"
                >
                  <Checkbox
                    checked={selectedTasks[index] || false}
                    onCheckedChange={() => handleToggleTask(index)}
                    backgroundColor={selectedTasks[index] ? "#000" : "#F5F5DC"}
                    borderColor={selectedTasks[index] ? "#000" : "#D3D3D3"}
                    marginRight="$2"
                  >
                    {selectedTasks[index] && (
                      <Checkbox.Indicator>
                        <Ionicons name="checkmark" size={16} color="#00C851" />
                      </Checkbox.Indicator>
                    )}
                  </Checkbox>

                  <YStack flex={1} gap="$1" opacity={selectedTasks[index] ? 0.6 : 1}>
                    <XStack alignItems="center" gap="$2">
                      <Ionicons name={getPriorityIcon(task.priority)} size={16} color={getPriorityColor(task.priority)} />
                      <Text color={isDark ? "#fff" : "#000"} fontFamily="$body" fontSize={16} fontWeight="500"> {task.name} </Text>
                    </XStack>

                    <XStack gap="$2" alignItems="center" flexWrap="wrap">
                      <XStack backgroundColor={`${getRecurrenceColor(task.recurrencePattern)}20`} px="$2" py="$1" br={4} >
                        <Text fontFamily="$body" color={getRecurrenceColor(task.recurrencePattern)} fontSize={12} fontWeight="600">
                          {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                        </Text>
                      </XStack>

                      {task.time && ( <Text color={isDark ? "#999" : "#666"} fontSize={12}> {task.time} </Text>)}
                      {task.schedule.length > 0 && (<Text color={isDark ? "#999" : "#666"} fontFamily="$body" fontSize={12}> {formatScheduleDays(task.schedule)} </Text>)}
                    </XStack>
                  </YStack>
                </XStack>
              ))}
            </YStack>
          )}
        </ScrollView>

        {recommendedTasks.length > 0 && (
          <Button
            backgroundColor={isDark ? `${primaryColor}40` : `${adjustColor(primaryColor, 20)}80`}
            color={isDark ? `${primaryColor}` : `${primaryColor}`}
            br={8}
            py={isWeb ? "$1" : "$2"}
            mt={isWeb ? "$4" : "$4"}
            onPress={handleSaveSelectedTasks}
            pressStyle={{ opacity: 0.7 }}
            disabled={Object.values(selectedTasks).filter(Boolean).length === 0}
            opacity={Object.values(selectedTasks).filter(Boolean).length === 0 ? 0.1 : 1}
            borderWidth={2}
            borderColor={primaryColor}
          >
            <Text color={isDark ?  `#f9f9f9` : `${adjustColor(primaryColor, -100)}80`} fontFamily="$body" fontSize={15} fontWeight="600">
              Add Selected Tasks
            </Text>
          </Button>
        )}

        {!isWeb && showScrollToTop && (
          <Circle
            size={44}
            backgroundColor={isDark ? "rgba(219, 208, 198, 0.2)" : "rgba(0, 0, 0, 0.1)"}
            position="absolute"
            bottom={70}
            right={10}
            opacity={0.9}
            pressStyle={{ opacity: 0.7 }}
            onPress={() => {
              scrollViewRef.current?.scrollTo({ y: 0, animated: true });
            }}
            elevation={4}
            shadowColor="rgba(0,0,0,0.3)"
            shadowOffset={{ width: 0, height: 2 }}
            shadowOpacity={0.3}
            shadowRadius={3}
          >
            <AntDesign name="arrowup" size={24} color={isDark ? "#dbd0c6" : "#000"} />
          </Circle>
        )}
      </YStack>
    </BaseCardModal>
  )
}
