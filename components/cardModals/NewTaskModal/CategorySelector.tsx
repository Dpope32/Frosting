// @ts-nocheck
import React, { useState, useRef } from 'react'
import { useColorScheme, Alert, Platform } from 'react-native'
import { YStack, XStack, Text, Button, ScrollView, isWeb } from 'tamagui'
import { TaskCategory } from '@/types'
import { getCategoryColor, withOpacity, getRandomCustomCategoryIcon, getDarkerColor } from '@/utils/styleUtils'
import { isIpad } from '@/utils/deviceUtils'
import { useCustomCategoryStore, useUserStore, useToastStore } from '@/store'
import { DebouncedTagInput } from '@/components/shared/debouncedTagInput'
import { Check, Plus } from '@tamagui/lucide-icons'

interface CategorySelectorProps {
  selectedCategory: TaskCategory
  onCategorySelect: (category: TaskCategory, e?: any) => void
}

const DEFAULT_CATEGORIES = ['work', 'health', 'personal', 'family', 'wealth'];

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const addCategory = useCustomCategoryStore((s) => s.addCategory)
  const removeCategoryFromStore = useCustomCategoryStore((s) => s.removeCategory)
  const getCategoryByName = useCustomCategoryStore((s) => s.getCategoryByName)
  const deleteDefaultCategory = useCustomCategoryStore((s) => s.deleteDefaultCategory)
  const isDefaultCategoryDeleted = useCustomCategoryStore((s) => s.isDefaultCategoryDeleted)
  const userColor = useUserStore((s) => s.preferences.primaryColor)
  const showToast = useToastStore((s) => s.showToast)
  
  // Add state for creating a new category
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const lastTapRef = useRef<number>(0);


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

  const confirmDeleteCategory = (categoryName: string) => {
    // Check if it's a custom or default category
    const customCategory = customCategories.find(cat => cat.name === categoryName);
    let categoryId: string | undefined;
    if (customCategory) {
      categoryId = customCategory.id;
    } else {
      // For default categories, use the name as the id
      categoryId = categoryName;
    }

    const message = `Are you sure you want to delete the category "${categoryName}"? This action cannot be undone.`;

    if (Platform.OS === 'web') {
      if (window.confirm(message)) {
        handleRemoveCategory(categoryId, categoryName, !!customCategory);
      }
    } else {
      Alert.alert(
        'Confirm Deletion',
        message,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            onPress: () => handleRemoveCategory(categoryId, categoryName, !!customCategory),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleRemoveCategory = (categoryId: string, categoryName: string, isCustom: boolean) => {
    if (isCustom) {
      removeCategoryFromStore(categoryId);
    } else {
      deleteDefaultCategory(categoryName);
    }
    showToast(`Category "${categoryName}" deleted`, 'success');
    if (selectedCategory === categoryName) {
      onCategorySelect('task');
    }
  };

  // Filter out deleted default categories
  const visibleDefaultCategories = DEFAULT_CATEGORIES.filter(cat => !isDefaultCategoryDeleted(cat));

  const handleCategoryButtonPress = (cat: string, isSelected: boolean, e: any) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected, ignore
      lastTapRef.current = now;
      return;
    }
    lastTapRef.current = now;
    onCategorySelect(cat as TaskCategory, e);
  };

  const handleCategoryLongPress = (cat: string) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Ignore long press if it was a double tap
      return;
    }
    confirmDeleteCategory(cat);
  };

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
            {[...customCategories.map(cat => cat.name), ...visibleDefaultCategories].map(cat => {
              const isCustom = customCategories.some(c => c.name === cat);
              const color = isCustom ? userColor : getCategoryColor(cat as TaskCategory);
              const isSelected = selectedCategory === cat;
              const categoryType = cat as TaskCategory;
              return (
                <Button
                  key={cat}
                  onPress={(e) => handleCategoryButtonPress(cat, isSelected, e)}
                  onLongPress={() => handleCategoryLongPress(cat)}
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
                      : isDark ? "$gray7" : "$gray8"
                  }
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="$body"
                    color={
                      isSelected
                        ? (isCustom ? getDarkerColor(color, 0.5) : (isDark ? getCategoryColor(categoryType) : '$gray12'))
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
            <XStack alignItems="center">
              <Button
                onPress={toggleAddCategory}
                key="start-add-category"
                size="$2"
                circular
                icon={<Plus size={isWeb ? 16 : 14} color={isDark ? "$gray11" : "$gray11"} />}
                backgroundColor={isDark ? "$gray2" : "white"}
                borderWidth={1}
                borderColor={isDark ? "$gray7" : "$gray8"}
                hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                pressStyle={{ opacity: 0.7 }}
              />
            </XStack>
          </XStack>
        </ScrollView>
      )}
    </XStack>
  )
}
