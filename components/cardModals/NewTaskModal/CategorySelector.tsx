import React from 'react'
import { useColorScheme, Alert, Platform } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView, isWeb } from 'tamagui'
import { TaskCategory } from '@/types/task'
import { getCategoryColor, withOpacity, getRandomCustomCategoryIcon, getDarkerColor } from '@/utils/styleUtils'
import { isIpad } from '@/utils/deviceUtils'
import { useCustomCategoryStore } from '@/store/CustomCategoryStore'
import { useUserStore } from '@/store/UserStore'

interface CategorySelectorProps {
  selectedCategory: TaskCategory
  onCategorySelect: (category: TaskCategory, e?: any) => void
}

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const addCategory = useCustomCategoryStore((s) => s.addCategory)
  const userColor = useUserStore((s) => s.preferences.primaryColor)

  // Helper for prompt (MVP: use window.prompt on web, Alert.prompt on iOS, fallback to Alert on Android)
  const handleAddCustomCategory = () => {
    const promptForName = (cb: (name: string) => void) => {
      if (Platform.OS === 'web') {
        const name = window.prompt('Enter new category name:')
        if (name) cb(name)
      } else if (Platform.OS === 'ios') {
        // @ts-ignore
        Alert.prompt('New Category', 'Enter a name for your category:', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'OK', onPress: (name) => name && cb(name) },
        ])
      } else {
        // Android: fallback to Alert and then use a default name
        Alert.alert('New Category', 'Feature coming soon! (MVP: use web or iOS for now)')
      }
    }
    promptForName((name) => {
      try {
        // Check for empty name
        if (!name || name.trim() === '') {
          Alert.alert('Invalid name', 'Please enter a valid category name.')
          return
        }

        // Check for duplicates
        if ([...customCategories, 'work', 'health', 'personal', 'family', 'wealth', 'bills', 'task'].some(cat => 
          typeof cat === 'string' 
            ? cat.toLowerCase() === name.toLowerCase() 
            : cat.name.toLowerCase() === name.toLowerCase()
        )) {
          Alert.alert('Category exists', 'A category with that name already exists.')
          return
        }
        
        // Get random icon
        const icon = getRandomCustomCategoryIcon()
        
        // Add the category to store
        try {
          const newCat = addCategory(name)
          
          if (!newCat || !newCat.name) {
            Alert.alert('Error', 'Failed to create category. Please try again.')
            return
          }
          
          // Overwrite icon (MVP: store icon in custom category store in future)
          newCat.icon = icon
          
          // Select the category using its name (which is what the parent component expects)
          onCategorySelect(newCat.name)
        } catch (error) {
          console.error('Error creating category:', error)
          Alert.alert('Error', 'An unexpected error occurred. Please try again.')
        }
      } catch (error) {
        console.error('Category creation error:', error)
        Alert.alert('Error', 'An unexpected error occurred.')
      }
    })
  }

  return (
    <YStack px="$1.5" gap="$1" pb="$2">
      {isWeb && isIpad() && <Text color={isDark ? "$gray8" : "$gray9"} fontFamily="$body" fontWeight="500">Category</Text>}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
        <XStack gap="$2">
          {[...customCategories.map(cat => cat.name), 'work', 'health', 'personal', 'family', 'wealth'].map(cat => {
            const isCustom = customCategories.some(c => c.name === cat);
            const color = isCustom ? userColor : getCategoryColor(cat as TaskCategory);
            const isSelected = selectedCategory === cat;
            return (
              <Button
                key={cat}
                onPress={(e) => onCategorySelect(cat as TaskCategory, e)}
                backgroundColor={
                  isSelected
                    ? withOpacity(color, 0.15)
                    : isDark ? "$gray2" : "white"
                }
                pressStyle={{ opacity: 0.8, scale: 0.98 }}
                br={20}
                px="$3"
                py="$2.5"
                borderWidth={1}
                borderColor={
                  isSelected
                    ? 'transparent'
                    : isDark ? "$gray7" : "$gray4"
                }
              >
                <Text
                  fontSize={14}
                  fontWeight="600"
                  fontFamily="$body"
                  color={
                    isSelected
                      ? (isCustom ? getDarkerColor(color, 0.5) : (isDark ? getCategoryColor : '$gray12'))
                      : isDark
                        ? "$gray11"
                        : "$gray11"
                  }
                >
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </Text>
              </Button>
            )
          })}
          <Button
            onPress={handleAddCustomCategory}
            backgroundColor={isDark ? "$gray2" : "white"}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={20}
            px="$3"
            py="$2.5"
            borderWidth={1}
            borderColor={isDark ? "$gray7" : "$gray4"}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <Text
              fontSize={18}
              fontWeight="600"
              fontFamily="$body"
              color={isDark ? "$gray11" : "$gray11"}
              style={{ textAlign: 'center', width: 18 }}
            >
              +
            </Text>
          </Button>
        </XStack>
      </ScrollView>
    </YStack>
  )
}
