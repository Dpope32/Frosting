import React, { useState, useEffect } from 'react';
import { Platform, Keyboard, View, KeyboardEvent } from 'react-native';
import { XStack, YStack, Text, Button, Input } from 'tamagui';
import { Plus, X, Check } from '@tamagui/lucide-icons';
import type { Tag } from '@/types/tag';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DebouncedTagInput } from '../shared/debouncedTagInput';
import { useTagStore } from '@/store/TagStore';
import { isIpad } from '@/utils/deviceUtils';
import { withOpacity, getDarkerColor } from '@/utils/styleUtils';

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

const TAG_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F97316', // Orange
  '#EF4444', // Red
];


export function TagSelector({
  tags,
  onTagsChange,
}: TagSelectorProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [selectedColor, setSelectedColor] = useState(TAG_COLORS[0]);
  const [keyboardVisible, setKeyboardVisible] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const isWeb = Platform.OS === 'web';
  const tagStoreTags = useTagStore((state) => state.tags);
  const addTagToStore = useTagStore((state) => state.addTag);

  const NEUTRAL_BORDER = isDark ? '$gray7' : '$gray4'; // Use Tamagui tokens for consistency
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
    onTagsChange([...tags, tag]);
    setNewTagName('');
    setIsAdding(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <YStack
      gap="$1"
      backgroundColor="transparent"
      borderRadius={8}
      padding={0}
      marginVertical={0}
      paddingHorizontal={isIpad() ? 8 : 10}
      mt={isWeb ? 4 : -8} 
    >
      <XStack alignItems="center" justifyContent="flex-start" gap={8}>
        {!isAdding && tagStoreTags.length === 0 && <Text fontSize={isIpad() ? 17 : 15} mb={isWeb ? 12 : 2}fontFamily="$body" fontWeight="500" color={isDark ? '#6c6c6c' : '#9c9c9c'}>Tags:</Text>}
        <XStack flexWrap="wrap" gap="$2" paddingLeft="$1" alignItems="center">
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
                br={20}
                px={isIpad() ? 12 : 8}
                py={isIpad() ? 12 : 8}
                borderWidth={1}
                borderColor={
                  isSelected
                    ? 'transparent'
                    : NEUTRAL_BORDER
                }
                onPress={() => {
                  if (isSelected) {
                    handleRemoveTag(tag.id);
                  } else {
                    onTagsChange([...tags, tag]);
                  }
                }}
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
                icon={<Check size={isWeb ? 16 : 14} color={isDark ? "$gray11" : "$gray11"} />}
                onPress={handleAddTag}
                backgroundColor="transparent"
                hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                pressStyle={{ opacity: 0.7 }}
                marginLeft={tagStoreTags.length ? 4 : 0}
              />
            ) : (
              <Button
                key="start-add-tag"
                size="$2"
                circular
                icon={<Plus size={isWeb ? 16 : 14} color={isDark ? "$gray11" : "$gray11"} />}
                onPress={() => setIsAdding(true)}
                backgroundColor="transparent"
                hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
                pressStyle={{ opacity: 0.7 }}
                marginLeft={tagStoreTags.length ? 4 : 0}
              />
            )
          )}
        </XStack>
          {isAdding && (
            <YStack gap={isWeb ? "$3" : "$1"} marginLeft={8} width="100%">
            <XStack position="relative" width="100%" maxWidth={isIpad() ? 200 : 170}>
              <DebouncedTagInput
                width="100%"
                placeholder="Tag Name"
                value={newTagName}
                mt={isWeb ? 0 : 0}
                onChangeText={setNewTagName}
                autoFocus
                fontSize="$3"
                onSubmitEditing={handleAddTag}
                onDebouncedChange={setNewTagName}
                paddingRight="$4"
                backgroundColor={isDark ? "rgba(255,255,255,0.0)" : "rgba(0,0,0,0.00)"}
                borderWidth={1}
                borderColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.1)"}
                borderRadius={4}
                fontFamily="$body"
                color={isDark ? "white" : "black"}
                placeholderTextColor={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
              />
              <Button
                size="$2"
                circular
                icon={<Check size={isWeb ? 14 : 16} color={selectedColor} />}
                onPress={handleAddTag}
                backgroundColor="transparent"
                position="absolute"
                right="$2"
                top={isWeb ? 0 : 6}
              />
            </XStack>
            
            <XStack gap={isWeb ? "$3" : "$2"} alignItems="center" mt="$2" ml={16}>
              {TAG_COLORS.map(color => (
                <Button
                  key={color}
                  size="$2"
                  circular
                  onPress={() => setSelectedColor(color)}
                  backgroundColor={color}
                  borderWidth={1}
                  borderColor={selectedColor === color ? 'white' : 'transparent'}
                />
              ))}
              
              <Button
                size="$2"
                circular
                icon={<Check size={isWeb ? 24 : 18} />}
                onPress={handleAddTag}
                backgroundColor="transparent"
                color="#1E40AF"
                ml="auto"
              />
            </XStack>
          </YStack>
        )}
      </XStack>
    </YStack>
  );
}
