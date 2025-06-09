import React from 'react';
import { Platform, View, TouchableOpacity } from 'react-native';
import { XStack, YStack, Text, Button, Sheet } from 'tamagui';
import { MaterialIcons } from '@expo/vector-icons';

export const TAG_COLORS = [
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
  
// Simple color picker modal that doesn't affect the primary color
export function TagColorPickerModal({
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
              Tag Color
            </Text>
            <TouchableOpacity onPress={() => onOpenChange(false)} style={{ padding: 8 }}>
              <MaterialIcons name="close" size={24} color={textColor} />
            </TouchableOpacity>
          </XStack>
  
          <YStack gap="$4" paddingVertical="$2">
            <XStack flexWrap="wrap" justifyContent="center" gap="$3">
              {TAG_COLORS.map(color => (
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