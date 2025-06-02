import React, { useState, useRef } from 'react'
import { useColorScheme, Alert, Platform, View, TouchableOpacity } from 'react-native'
import {  XStack, YStack, Text, Button, ScrollView, isWeb, Sheet } from 'tamagui'
import { TaskCategory } from '@/types'
import { getCategoryColor, withOpacity, getRandomCustomCategoryIcon, getDarkerColor, isIpad } from '@/utils'
import { useCustomCategoryStore, useUserStore, useToastStore } from '@/store'
import { DebouncedInput } from '@/components/shared/debouncedInput'
import { MaterialIcons } from '@expo/vector-icons'

interface CategorySelectorProps {
  selectedCategory: TaskCategory
  onCategorySelect: (category: TaskCategory, e?: any) => void
}

const DEFAULT_CATEGORIES = ['work', 'health', 'personal', 'family', 'wealth'];

const CATEGORY_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F97316', // Orange
  '#EF4444', // Red
  '#1E40AF', // Indigo
  '#A855F7', // Purple
  '#EC4899', // Pink
  '#FACC15', // Yellow
  '#14B8A6', // Teal
  '#0EA5E9', // Sky Blue
  '#06B6D4', // Cyan
  '#8B5CF6', // Violet
  '#D946EF', // Fuchsia
  '#F43F5E', // Rose
  '#10B981', // Emerald
  '#84CC16', // Lime
  '#78350F', // Brown
  '#0F172A', // Slate
];

// Category color picker modal
function CategoryColorPickerModal({
  open,
  onOpenChange,
  selectedColor,
  onColorChange,
  isDark,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedColor: string;
  onColorChange: (color: string) => void;
  isDark: boolean;
}) {
  const backgroundColor = isDark ? 'rgba(28,28,28,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = isDark ? '#fff' : '#000';

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[40]}
      zIndex={100001}
      disableDrag={true}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
        opacity={0.8}
      />
      <Sheet.Frame
        backgroundColor={backgroundColor}
        paddingHorizontal="$4"
        paddingVertical="$4"
        gap="$3"
      >
        <XStack justifyContent="space-between" alignItems="center" paddingBottom="$1">
          <Text fontSize={20} fontWeight="600" color={textColor} flex={1} textAlign="center" marginLeft="$6">
            Category Color
          </Text>
          <TouchableOpacity onPress={() => onOpenChange(false)} style={{ padding: 8 }}>
            <MaterialIcons name="close" size={24} color={textColor} />
          </TouchableOpacity>
        </XStack>

        <YStack gap="$4" paddingVertical="$2">
          <XStack flexWrap="wrap" justifyContent="center" gap="$3">
            {CATEGORY_COLORS.map(color => (
              <Button
                key={color}
                size="$4"
                circular
                backgroundColor={color}
                borderWidth={3}
                borderColor={selectedColor === color ? 'white' : 'transparent'}
                onPress={() => {
                  onColorChange(color);
                  onOpenChange(false);
                }}
              />
            ))}
          </XStack>
          
          {Platform.OS === 'web' && (
            <XStack justifyContent="center" marginTop="$2">
              <View style={{ alignItems: 'center' }}>
                <Text fontSize={14} color={textColor} marginBottom="$1">
                  Custom Color
                </Text>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => onColorChange(e.target.value)}
                  style={{ 
                    width: '100px', 
                    height: '40px',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                  }}
                />
              </View>
            </XStack>
          )}
        </YStack>
      </Sheet.Frame>
    </Sheet>
  );
}

export function CategorySelector({ selectedCategory, onCategorySelect }: CategorySelectorProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const customCategories = useCustomCategoryStore((s) => s.categories)
  const addCategory = useCustomCategoryStore((s) => s.addCategory)
  const removeCategoryFromStore = useCustomCategoryStore((s) => s.removeCategory)
  const deleteDefaultCategory = useCustomCategoryStore((s) => s.deleteDefaultCategory)
  const isDefaultCategoryDeleted = useCustomCategoryStore((s) => s.isDefaultCategoryDeleted)
  const userColor = useUserStore((s) => s.preferences.primaryColor)
  const showToast = useToastStore((s) => s.showToast)
  const [isAddingCategory, setIsAddingCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [selectedColor, setSelectedColor] = useState(CATEGORY_COLORS[0])
  const [colorPickerOpen, setColorPickerOpen] = useState(false)
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
      
      // Add the category to store with selected color
      try {
        const newCat = addCategory(newCategoryName.trim(), selectedColor)
        
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
    <XStack pl={isWeb ? 8 : isIpad() ? 10 : 8} gap="$2" alignItems="center">
      <Text color={isDark ? '#6c6c6c' : '#9c9c9c'} fontSize={isIpad() ? 17 : 15}  fontFamily="$body" fontWeight="500">Category:</Text>
      {isAddingCategory ? (
        <YStack gap={isWeb ? "$3" : "$1"} mt={isWeb ? "$3" : "$1.5"} ml={isIpad() ? "$2" : "$1"} width="100%">
          <XStack position="relative" width="100%" maxWidth={"100%"} alignItems="center" gap="$2">
            <XStack position="relative" width="40%" alignItems="center">
              <DebouncedInput
                width="100%"
                placeholder="Category Name"
                value={newCategoryName}
                onChangeText={setNewCategoryName}
                autoFocus
                fontSize="$3"
                px="$3"
                py="$2"
                onSubmitEditing={handleCreateNewCategory}
                onDebouncedChange={() => {}}
                paddingRight="$4"
                backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
                borderWidth={1}
                delay={0}
                borderColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                borderRadius={8}
                fontFamily="$body"
                color={isDark ? "white" : "black"}
                placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              />
            </XStack>
            
            <Button
              size="$2"
              circular
              backgroundColor={selectedColor}
              onPress={() => setColorPickerOpen(true)}
              borderWidth={1}
              borderColor="white"
            />
            
            {newCategoryName.trim() !== '' && (
              <Button
                size="$2"
                px="$2"
                br={8}
                backgroundColor={selectedColor}
                icon={<MaterialIcons name="check" size={isWeb ? 16 : 14} color="white" />}
                onPress={handleCreateNewCategory}
                pressStyle={{ opacity: 0.8 }}
              />
            )}
            
            <Button
              size="$2"
              circular
              icon={<MaterialIcons name="close" size={isWeb ? 20 : 16} color={"rgba(255, 0, 0, 0.77)"} />}
              onPress={() => setIsAddingCategory(false)}
              backgroundColor="transparent"
              pressStyle={{ opacity: 0.7 }}
            />
          </XStack>
        </YStack>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <XStack gap="$2">
            {[...customCategories.map(cat => cat.name), ...visibleDefaultCategories].map(cat => {
              const isCustom = customCategories.some(c => c.name === cat);
              const customCategory = customCategories.find(c => c.name === cat);
              const color = isCustom && customCategory?.color ? customCategory.color : getCategoryColor(cat as TaskCategory);
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
                  py={isIpad() ? "$2.5" : "$1"}
                  height={isWeb? 50 : isIpad() ? undefined : 35}
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
                        ? getDarkerColor(color, 0.5)
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
            <XStack alignItems="center" justifyContent="center" alignSelf="center" alignContent="center">
              <Button
                onPress={toggleAddCategory}
                key="start-add-category"
                size="$2"
                circular
                icon={<MaterialIcons name="add" size={isWeb ? 16 : 14} color={isDark ? "#5a5a5a" : "#9c9c9c"} />}
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
      
      <CategoryColorPickerModal
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        isDark={isDark}
      />
    </XStack>
  )
}
