import React, { useCallback, useState } from 'react'; // Import useState
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import { Sheet, Button, Text, Circle, XStack, YStack } from 'tamagui';
import { useToastStore } from '@/store/ToastStore';
import { X } from '@tamagui/lucide-icons'; // Import X icon
import { useUserStore } from '@/store/UserStore';

// Define a default empty component for ColorPicker
const EmptyColorPicker = () => null;

// Import the color picker directly for native platforms
// For web, we'll use our custom web color picker
import WheelColorPicker from 'react-native-wheel-color-picker';

// Use the imported component or fallback to empty component
const ColorPicker = Platform.OS === 'web' ? EmptyColorPicker : WheelColorPicker;

interface ColorPickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedColor: string
  onColorChange: (color: string) => void
  colorOptions?: ReadonlyArray<{ readonly label: string; readonly value: string }>
  isDark?: boolean
}

export function ColorPickerModal({
  open,
  onOpenChange,
  selectedColor,
  onColorChange,
  colorOptions = [],
  isDark = false,
}: ColorPickerModalProps) {
  const showToast = useToastStore((state) => state.showToast);
  const preferences = useUserStore(state => state.preferences);
  const setPreferences = useUserStore(state => state.setPreferences);
  // Removed isPickerInteracting state
  const backgroundColor = isDark ? 'rgba(28,28,28,0.95)' : 'rgba(255,255,255,0.95)';
  const textColor = isDark ? '#fff' : '#000';
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';

  const handleColorChange = useCallback((color: string) => {
    if (color !== selectedColor) {
      onColorChange(color)
    }
  }, [selectedColor, onColorChange])

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[60]}
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
        position="relative"
      >
        
        <XStack justifyContent="space-between" alignItems="center" paddingBottom="$1">
          <Text fontSize={20} fontWeight="600" color={textColor} flex={1} textAlign="center" marginLeft="$6"> 
            Color Selection
          </Text>
          <TouchableOpacity onPress={() => onOpenChange(false)} style={{ padding: 8 }}> 
            <X size={24} color={textColor} />
          </TouchableOpacity>
        </XStack>
        <YStack gap="$3"> 
          <YStack gap="$2">
            <View style={styles.pickerContainer}>
              {Platform.OS === 'web' ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={(e) => handleColorChange(e.target.value)}
                    style={{ 
                      width: '200px', 
                      height: '200px',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      backgroundColor: 'transparent'
                    }}
                  />
                </View>
              ) : (
                <ColorPicker
                  color={selectedColor}
                  onColorChange={handleColorChange}
                  thumbSize={25}
                  sliderSize={25}
                  noSnap={true}
                  row={false}
                />
              )}
            </View>
          </YStack>
        </YStack>
        <Button
            backgroundColor={selectedColor}
            height={45}
            width={120} 
            position='absolute'
            bottom={50}
            right={30}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => {
              onOpenChange(false);
              setPreferences({ ...preferences, primaryColor: selectedColor });
              showToast('Primary color updated!', 'success');
            }}
            alignSelf="flex-end"
          >
            <Text color="#fff" fontWeight="500">
              Done
            </Text>
          </Button>
      </Sheet.Frame>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  pickerContainer: {
    height: 330, // Reduced height
    width: '100%',
    padding: 12, // Adjusted padding
  },
  closeButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 1,
    padding: 5,
  },
})
