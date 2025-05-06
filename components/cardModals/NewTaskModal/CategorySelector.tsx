import React, { useState } from 'react'
import { useColorScheme, Alert, Platform } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView, isWeb } from 'tamagui'
import { TaskCategory } from '@/types/task'
import { getCategoryColor, withOpacity, getRandomCustomCategoryIcon, getDarkerColor } from '@/utils/styleUtils'
import { isIpad } from '@/utils/deviceUtils'
import { useCustomCategoryStore } from '@/store/CustomCategoryStore'
import { useUserStore } from '@/store/UserStore'
import { DebouncedTagInput } from '@/components/shared/debouncedTagInput'
import { Check } from '@tamagui/lucide-icons'

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
  
  // Add state for creating a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')


  const handleCreateNewCategory = () => {
    try {
      // Check for empty name
      if (!newCategoryName || newCategoryName.trim() === '') {
        Alert.alert('Invalid name', 'Please enter a valid category name.')
        return
      }

      // Check for duplicates
      if ([...customCategories, 'work', 'health', 'personal', 'family', 'wealth', 'bills', 'task'].some(cat => 
        typeof cat === 'string' 
          ? cat.toLowerCase() === newCategoryName.toLowerCase() 
          : cat.name.toLowerCase() === newCategoryName.toLowerCase()
      )) {
        Alert.alert('Category exists', 'A category with that name already exists.')
        return
      }
      
      // Get random icon
      const icon = getRandomCustomCategoryIcon()
      
      // Add the category to store
      try {
        const newCat = addCategory(newCategoryName)
        
        if (!newCat || !newCat.name) {
          Alert.alert('Error', 'Failed to create category. Please try again.')
          return
        }
        
        // Overwrite icon (MVP: store icon in custom category store in future)
        newCat.icon = icon
        
        // Select the category using its name (which is what the parent component expects)
        onCategorySelect(newCat.name)
        
        // Clear and close input
        setNewCategoryName('')
        setIsAddingCategory(false)
      } catch (error) {
        console.error('Error creating category:', error)
        Alert.alert('Error', 'An unexpected error occurred. Please try again.')
      }
    } catch (error) {
      console.error('Category creation error:', error)
      Alert.alert('Error', 'An unexpected error occurred.')
    }
  }

  // Toggle add category mode
  const toggleAddCategory = () => {
    setIsAddingCategory(!isAddingCategory)
    if (!isAddingCategory) {
      setNewCategoryName('')
    }
  }

  return (
    <XStack pl={8} gap="$2" alignItems="center">
      {isAddingCategory ? (
        <XStack gap="$2" alignItems="center" py="$1">
          <XStack position="relative" width={isIpad() ? 180 : 140}>
            <DebouncedTagInput
              width="100%"
              placeholder="Category Name"
              value={newCategoryName}
              onChangeText={setNewCategoryName}
              onDebouncedChange={setNewCategoryName}
              autoFocus
              fontSize="$3"
              onSubmitEditing={handleCreateNewCategory}
              paddingRight="$8"
              backgroundColor={isDark ? "rgba(255,255,255,0.0)" : "rgba(0,0,0,0.00)"}
              borderWidth={1}
              borderColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
              borderRadius={4}
              fontFamily="$body"
              color={isDark ? "white" : "black"}
              placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              py="$1"
            />
            <Button
              size="$2"
              circular
              icon={<Check size={isWeb ? 14 : 16} color={isDark ? userColor : userColor} />}
              onPress={handleCreateNewCategory}
              backgroundColor="transparent"
              position="absolute"
              right="$2"
              top={isWeb ? 0 : 6}
            />
          </XStack>
          <Button
            onPress={() => setIsAddingCategory(false)}
            backgroundColor={isDark ? "$gray2" : "white"}
            pressStyle={{ opacity: 0.8, scale: 0.98 }}
            br={20}
            px="$2"
            py="$1"
            borderWidth={1}
            borderColor={isDark ? "$gray7" : "$gray4"}
            style={{ justifyContent: 'center', alignItems: 'center' }}
          >
            <Text
              fontSize={14}
              fontWeight="600"
              fontFamily="$body"
              color={isDark ? "$gray11" : "$gray11"}
            >
              Cancel
            </Text>
          </Button>
        </XStack>
      ) : (
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
                        ? (isCustom ? getDarkerColor(color, 0.5) : (isDark ? getCategoryColor(cat as TaskCategory) : '$gray12'))
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
              onPress={toggleAddCategory}
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
      )}
    </XStack>
  )
}
