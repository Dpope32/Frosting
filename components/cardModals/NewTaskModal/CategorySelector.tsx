import React from 'react'
import { useColorScheme } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView, isWeb } from 'tamagui'
import { TaskCategory } from '@/types/task'
import { getCategoryColor, withOpacity } from '@/utils/styleUtils'
import { isIpad } from '@/utils/deviceUtils'

interface CategorySelectorProps {
  selectedCategory: TaskCategory
  onCategorySelect: (category: TaskCategory, e?: any) => void
}

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'

  return (
    <YStack px="$1.5" gap="$1.5">
      {isWeb && isIpad() && <Text color={isDark ? "$gray8" : "$gray9"} fontFamily="$body" fontWeight="500">Category</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
        <XStack gap="$2">
          {['work','health','personal','family','wealth'].map(cat => {
            const color = getCategoryColor(cat as TaskCategory)
            
            return (
              <Button
                key={cat}
                onPress={(e) => onCategorySelect(cat as TaskCategory, e)}
                backgroundColor={
                  selectedCategory === cat
                    ? withOpacity(color, 0.15)
                    : isDark ? "$gray2" : "white"
                }
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                br={20}
                px="$3"
                py="$2.5"
                borderWidth={1}
                borderColor={
                  selectedCategory === cat
                    ? 'transparent'
                    : isDark ? "$gray7" : "$gray4"
                }
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  fontFamily="$body"
                  color={selectedCategory === cat ? color : isDark ? "$gray12" : "$gray11"}
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Button>
            )
          })}
        </XStack>
      </ScrollView>
    </YStack>
  )
} 