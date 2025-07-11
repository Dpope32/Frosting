import React, { useState, useEffect, useRef } from 'react';
import { Platform, Keyboard, KeyboardEvent, Alert, View, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, Button, Sheet, ScrollView } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';
import type { Tag } from '@/types/tag';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DebouncedInput } from '@/components/shared/debouncedInput';
import { isIpad, withOpacity, getDarkerColor } from '@/utils';
import { useToastStore, useTagStore } from '@/store';
import { TagColorPickerModal, TAG_COLORS } from './TagColorPicker';

interface TagSelectorProps {
  tags: Tag[];
  onTagsChange: (tags: Tag[]) => void;
  onBold?: () => void;
  onItalic?: () => void;
  onUnderline?: () => void;
  onBullet?: () => void;
  onCode?: () => void;
  onAttachImage?: () => void;
}


export function TagSelector({
  tags,
  onTagsChange,
}: TagSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const tagStoreTags = useTagStore((state) => state.tags);
  const addTagToStore = useTagStore((state) => state.addTag);
  const removeTagFromStore = useTagStore((state) => state.removeTag);
  const showToast = useToastStore((s) => s.showToast);
  const lastTapRef = useRef<number>(0);

  const NEUTRAL_BORDER = isDark ? '$gray7' : '$gray8'; // Use Tamagui tokens for consistency
  const NEUTRAL_TEXT = isDark ? '$gray11' : '$gray11'; // Use Tamagui tokens for consistency

  // Handle keyboard visibility
  useEffect(() => {
    if (Platform.OS === 'web') return;

    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event: KeyboardEvent) => {
        setKeyboardVisible(true);
        setKeyboardHeight(event.endCoordinates.height);
      }
    );

    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setKeyboardVisible(false);
        setKeyboardHeight(0);
      }
    );

    return () => {
      keyboardWillShowListener.remove();
      keyboardWillHideListener.remove();
    };
  }, []);

  const handleAddTag = () => {
    if (newTagName.trim() === '') return;
    // Check if tag already exists in store
    let tag = tagStoreTags.find((t) => t.name === newTagName.trim());
    if (!tag) {
      tag = addTagToStore(newTagName.trim(), selectedColor);
    }
    
    // Check if this tag is already in the selected tags (by id)
    if (!tags.some(t => t.id === tag.id)) {
      onTagsChange([...tags, tag]);
    }
    
    setNewTagName('');
    setIsAdding(false);
  };

  const handleRemoveTag = (tagId: string) => {
    // Remove from store
    removeTagFromStore(tagId);
    // Also remove from the currently selected tags in the parent component
    const removedTag = tags.find(tag => tag.id === tagId);
    onTagsChange(tags.filter(tag => tag.id !== tagId));
    if (removedTag) {
      showToast(`Tag "${removedTag.name}" deleted`, 'success');
    }
  };

  const confirmDeleteTag = (tag: Tag) => {
    const message = `Are you sure you want to delete the tag "${tag.name}"? This action cannot be undone.`;

    if (Platform.OS === 'web') {
      // Use window.confirm on web
      if (window.confirm(message)) {
        handleRemoveTag(tag.id);
      }
    } else {
      // Use Alert on mobile
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
            onPress: () => handleRemoveTag(tag.id),
            style: 'destructive',
          },
        ],
        { cancelable: true }
      );
    }
  };

  const handleTagButtonPress = (tag: Tag, isSelected: boolean) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Double tap detected, ignore
      lastTapRef.current = now;
      return;
    }
    lastTapRef.current = now;
    
    // Only toggle selection, don't delete tags on press
    if (isSelected) {
      // Remove from selection without deleting from store
      onTagsChange(tags.filter(t => t.id !== tag.id));
    } else {
      if (!tags.some(t => t.id === tag.id)) {
        onTagsChange([...tags, tag]);
      }
    }
  };

  const handleTagLongPress = (tag: Tag) => {
    const now = Date.now();
    if (now - lastTapRef.current < 300) {
      // Ignore long press if it was a double tap
      return;
    }
    confirmDeleteTag(tag);
  };

  return (
    <YStack
      gap="$1"
      backgroundColor="transparent"
      borderRadius={8}
      padding={0}
      marginVertical={0}
      paddingHorizontal={isIpad() ? 8 : 2}
      mt={isWeb ? 4 : -10} 
      ml={4}
      mb={0}
    >
      <XStack alignItems="center" justifyContent="flex-start" gap={8}>
        {!isAdding && <Text fontSize={isIpad() ? 17 : 15} mb={isWeb ? 12 : 2} ml={isIpad() ? 0 : 2} fontFamily="$body" fontWeight="500" color={isDark ? '#6c6c6c' : '#9c9c9c'}>Tags:</Text>}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
          <XStack gap="$2" paddingLeft="$1" alignItems="center">
            {tagStoreTags.map(tag => {
              const tagColor = tag.color || NEUTRAL_BORDER;
              const isSelected = tags.some(t => t.id === tag.id);

              return (
                <Button
                  key={tag.id}
                  backgroundColor={
                    isSelected
                      ? withOpacity(tagColor, 0.15)
                      : isDark ? "$gray2" : "white"
                  }
                  pressStyle={{ opacity: 0.8, scale: 0.98 }}
                  onLongPress={() => handleTagLongPress(tag)}
                  br={20}
                  px="$3"
                  py={isIpad() ? "$2.5" : "$1"}
                  height={isWeb ? 50 : isIpad() ? undefined : 35}
                  borderWidth={1}
                  borderColor={
                    isSelected
                      ? 'transparent'
                      : NEUTRAL_BORDER
                  }
                  onPress={() => handleTagButtonPress(tag, isSelected)}
                >
                  <Text
                    fontSize={14}
                    fontWeight="600"
                    fontFamily="$body"
                    color={
                      isSelected
                        ? getDarkerColor(tagColor, 0.5)
                        : NEUTRAL_TEXT
                    }
                  >
                    {tag.name}
                  </Text>
                </Button>
              )
            })}

            {!isAdding && (
              keyboardVisible ? (
                <Button
                  key="confirm-new-tag"
                  size="$2"
                  circular
                  icon={<MaterialIcons name="check" size={isWeb ? 16 : 14} color={isDark ? "$gray11" : "$gray11"} />}
                  onPress={handleAddTag}
                  backgroundColor={isDark ? "$gray2" : "white"}
                  borderWidth={1}
                  borderColor={NEUTRAL_BORDER}
                  hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                  pressStyle={{ opacity: 0.7 }}
                  marginLeft={tagStoreTags.length ? 4 : 0}
                />
              ) : (
                <Button
                  key="start-add-tag"
                  size="$2"
                  circular
                  icon={<MaterialIcons name="add" size={isWeb ? 16 : 14} color={isDark ? "#6c6c6c" : "#9c9c9c"} />}
                  onPress={() => setIsAdding(true)}
                  backgroundColor={isDark ? "$gray2" : "white"}
                  borderWidth={1}
                  borderColor={NEUTRAL_BORDER}
                  hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                  pressStyle={{ opacity: 0.7 }}
                  marginLeft={tagStoreTags.length ? 4 : 0}
                />
              )
            )}
          </XStack>
        </ScrollView>
      </XStack>
          
      {isAdding && (
        <YStack gap={isWeb ? "$3" : "$1"} mt={isWeb ? "$3" : "$0"} ml={isIpad() ? "$0" : "$1"} width="100%">
          <XStack position="relative" width="100%" maxWidth={"100%"} alignItems="center" gap="$2">
            <XStack position="relative" width="40%" alignItems="center">
              <DebouncedInput
                width="100%"
                placeholder="Tag Name"
                value={newTagName}
                onChangeText={setNewTagName}
                autoFocus
                fontSize="$3"
                px="$3"
                py="$2"
                onSubmitEditing={handleAddTag}
                onDebouncedChange={() => {}}
                paddingRight="$4"
                backgroundColor={isDark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)"}
                borderWidth={1}
                delay={0}
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
              onPress={() => {
                Keyboard.dismiss();
                setColorPickerOpen(true);
              }}
              borderWidth={1}
              borderColor="white"
            />
            
            {newTagName.trim() !== '' && (
              <Button
                size="$2"
                px="$2"
                br={8}
                backgroundColor={selectedColor}
                icon={<MaterialIcons name="check" size={isWeb ? 16 : 14} color="white" />}
                onPress={handleAddTag}
                pressStyle={{ opacity: 0.8 }}
              />
            )}
            
            <Button
              size="$2"
              circular
              icon={<MaterialIcons name="close" size={isWeb ? 20 : 16} color={"rgba(255, 0, 0, 0.77)"} />}
              onPress={() => setIsAdding(false)}
              backgroundColor="transparent"
              pressStyle={{ opacity: 0.7 }}
            />
          </XStack>
        </YStack>
      )}
      
      <TagColorPickerModal
        open={colorPickerOpen}
        onOpenChange={setColorPickerOpen}
        selectedColor={selectedColor}
        onColorChange={setSelectedColor}
        isDark={isDark}
      />
    </YStack>
  );
}
