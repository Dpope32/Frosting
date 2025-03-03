import React, { useState } from 'react'
import { Platform, useColorScheme } from 'react-native'
import { YStack, Text, XStack, Button, ScrollView, Checkbox } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { Ionicons } from '@expo/vector-icons'
import { useProjectStore } from '@/store/ToDo'
import { 
  RecommendationCategory, 
  RecommendedTask, 
  getRecommendedTasks, 
  formatScheduleDays,
  getRecurrenceColor,
  getPriorityIcon,
  getPriorityColor
} from '@/utils/TaskRecommendations'

interface TaskRecommendationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  category: RecommendationCategory
}

export function TaskRecommendationModal({ 
  open, 
  onOpenChange, 
  category 
}: TaskRecommendationModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const addTask = useProjectStore(s => s.addTask)
  const [selectedTasks, setSelectedTasks] = useState<Record<number, boolean>>({})

  const handleToggleTask = (index: number) => {
    setSelectedTasks(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }
  
  const handleSaveSelectedTasks = () => {
    const recommendedTasks = getRecommendedTasks(category)
    Object.entries(selectedTasks).forEach(([indexStr, isSelected]) => {
      if (isSelected) {
        const index = parseInt(indexStr)
        const task = recommendedTasks[index]
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
    setSelectedTasks({})
    onOpenChange(false)
  }

  const recommendedTasks = getRecommendedTasks(category)

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title={`${category} Tasks`}
      snapPoints={[85]}
    >
      <YStack gap="$4" paddingBottom="$8">
        <Text 
          color={isDark ? "#dbd0c6" : "#666"} 
          fontSize={16}
          opacity={0.9}
        >
          Select tasks to add to your schedule:
        </Text>
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          bounces={false}
          maxHeight={500}
        >
          <YStack gap="$3">
            {recommendedTasks.map((task, index) => (
              <XStack 
                key={index}
                backgroundColor={isDark ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.8)"}
                borderRadius={12}
                padding="$3"
                borderWidth={1}
                borderColor={isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.1)"}
                alignItems="center"
                justifyContent="space-between"
              >
                <Checkbox
                  checked={selectedTasks[index] || false}
                  onCheckedChange={() => handleToggleTask(index)}
                  backgroundColor={selectedTasks[index] ? (isDark ? "#dbd0c6" : "#000") : "transparent"}
                  borderColor={isDark ? "#dbd0c6" : "#000"}
                  marginRight="$2"
                />
                
                <YStack flex={1} gap="$1">
                  <XStack alignItems="center" gap="$2">
                    <Ionicons 
                      name={getPriorityIcon(task.priority)} 
                      size={16} 
                      color={getPriorityColor(task.priority)} 
                    />
                    <Text 
                      color={isDark ? "#fff" : "#000"} 
                      fontSize={16} 
                      fontWeight="500"
                    >
                      {task.name}
                    </Text>
                  </XStack>
                  
                  <XStack gap="$2" alignItems="center" flexWrap="wrap">
                    <XStack 
                      backgroundColor={`${getRecurrenceColor(task.recurrencePattern)}20`}
                      paddingHorizontal="$2"
                      paddingVertical="$1"
                      borderRadius={4}
                    >
                      <Text 
                        color={getRecurrenceColor(task.recurrencePattern)} 
                        fontSize={12}
                        fontWeight="600"
                      >
                        {task.recurrencePattern.charAt(0).toUpperCase() + task.recurrencePattern.slice(1)}
                      </Text>
                    </XStack>
                    
                    {task.time && (
                      <Text color={isDark ? "#999" : "#666"} fontSize={12}>
                        {task.time}
                      </Text>
                    )}
                    
                    {task.schedule.length > 0 && (
                      <Text color={isDark ? "#999" : "#666"} fontSize={12}>
                        {formatScheduleDays(task.schedule)}
                      </Text>
                    )}
                  </XStack>
                </YStack>
              </XStack>
            ))}
          </YStack>
        </ScrollView>
        
        <Button
          backgroundColor={isDark ? "rgba(219, 208, 198, 0.2)" : "rgba(0, 0, 0, 0.1)"}
          color={isDark ? "#dbd0c6" : "#000"}
          borderRadius={8}
          paddingVertical="$3"
          marginTop="$4"
          onPress={handleSaveSelectedTasks}
          pressStyle={{ opacity: 0.7 }}
          disabled={Object.values(selectedTasks).filter(Boolean).length === 0}
          opacity={Object.values(selectedTasks).filter(Boolean).length === 0 ? 0.5 : 1}
        >
          <Text 
            color={isDark ? "#dbd0c6" : "#000"} 
            fontSize={16} 
            fontWeight="600"
          >
            Add Selected Tasks
          </Text>
        </Button>
      </YStack>
    </BaseCardModal>
  )
}
