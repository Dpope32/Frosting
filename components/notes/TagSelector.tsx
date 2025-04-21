import React, { useState, useEffect } from 'react';
import { Platform, Keyboard, View, KeyboardEvent } from 'react-native';
import { XStack, YStack, Text, Button, Input } from 'tamagui';
import { Plus, X, Check } from '@tamagui/lucide-icons';
import type { Tag } from '@/types/notes';
import { useColorScheme } from '@/hooks/useColorScheme';
import { DebouncedInput } from '../shared/debouncedInput';

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

// Predefined tag colors
const TAG_COLORS = [
  '#3B82F6', // Blue
  '#22C55E', // Green
  '#F97316', // Orange
  '#EF4444', // Red
];

const darkenColor = (color: string | undefined) => {
  if (!color) return '#000000';
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  return `rgb(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.7)})`;
};

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
    
    const newTag: Tag = {
      id: Date.now().toString(),
      name: newTagName.trim(),
      color: selectedColor
    };
    
    onTagsChange([...tags, newTag]);
    setNewTagName('');
    setIsAdding(false);
  };

  const handleRemoveTag = (tagId: string) => {
    onTagsChange(tags.filter(tag => tag.id !== tagId));
  };

  return (
    <YStack 
      gap="$1" 
      paddingTop={keyboardVisible ? "$1" : "$2"}
      backgroundColor={'$background'} 
      borderRadius={8} 
      padding={keyboardVisible ? "$2" : "$3"}
      marginVertical="$1"
      style={{
        marginBottom: keyboardVisible ? keyboardHeight * 0.3 : 0,
      }}
    >
      <XStack alignItems="center" justifyContent="space-between">
        <XStack alignItems="center" justifyContent='center' gap="$2">
          <Text fontSize="$4" mb={isWeb ? 12 : 4} fontFamily="$body" fontWeight="600" color={isDark ? '#e0e0e0' : '#333333'}>Tags:</Text>
          {tags.length > 0 && (
            <XStack flexWrap="wrap" gap="$2" paddingLeft="$1">
              {tags.map(tag => (
                <XStack
                  key={tag.id}
                  backgroundColor={`${tag.color}30`}
                  borderRadius="$4"
                  paddingVertical="$1"
                  paddingHorizontal="$2"
                  alignItems="center"
                  gap="$1"
                  borderWidth={1}
                  borderColor={tag.color}
                >
                  <Text 
                    fontSize="$3" 
                    color={darkenColor(tag.color)}
                    fontWeight="700"
                    fontFamily="$body"
                  >
                    {tag.name}
                  </Text>
                  <Button
                    size="$1"
                    circular
                    icon={<X size={12} color={isDark ? "white" : tag.color} />}
                    onPress={() => handleRemoveTag(tag.id)}
                    backgroundColor="transparent"
                    padding="$0"
                  />
                </XStack>
              ))}
            </XStack>
          )}
        </XStack>
        {!isAdding && (
          <Button
            size="$2"
            circular
            icon={<Plus size={isWeb ? 16 : 18} color={isDark ? "#e0e0e0" : "#333333"} />}
            onPress={() => setIsAdding(true)}
            backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
            hoverStyle={{ backgroundColor: isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.1)" }}
            pressStyle={{ opacity: 0.7 }}
          />
        )}
      </XStack>

      {isAdding && (
        <YStack gap={isWeb ? "$4" : "$3"}>
          <XStack alignItems="center" gap={isWeb ? "$3" : "$2"}>
            <XStack position="relative" width={150}>
              <DebouncedInput
                width="100%"
                placeholder="Tag name"
                value={newTagName}
                mt={isWeb ? 0 : 6}
                onChangeText={setNewTagName}
                autoFocus
                fontSize="$3"
                onSubmitEditing={handleAddTag}
                onDebouncedChange={setNewTagName}
                paddingRight="$4"
                backgroundColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"}
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
                icon={<X size={isWeb ? 14 : 16} />}
                onPress={() => setIsAdding(false)}
                backgroundColor="transparent"
                color={isDark ? "white" : "black"}
                position="absolute"
                right="$2"
                top={isWeb ? 0 : 6}
              />
            </XStack>
            <XStack flexWrap="wrap" gap={isWeb ? "$3" : "$2"} alignItems="center">
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
            </XStack>
            <Button
              size="$2"
              circular
              icon={<Check size={isWeb ? 24 : 18} />}
              onPress={handleAddTag}
              backgroundColor="transparent"
              color="#1E40AF"
            />
          </XStack>
        </YStack>
      )}
    </YStack>
  );
}
