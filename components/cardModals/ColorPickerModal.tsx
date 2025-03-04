import React, { useCallback } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { Sheet, Button, Text, Circle, XStack, YStack } from 'tamagui'

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
  const backgroundColor = isDark ? 'rgba(28,28,28,0.95)' : 'rgba(255,255,255,0.95)'
  const textColor = isDark ? '#fff' : '#000'
  const borderColor = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'

  // Debounce color changes to prevent infinite updates
  const handleColorChange = useCallback((color: string) => {
    // Only update if color has actually changed
    if (color !== selectedColor) {
      onColorChange(color)
    }
  }, [selectedColor, onColorChange])

  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      dismissOnSnapToBottom
      snapPoints={[85]}
      zIndex={100000}
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
        padding="$4"
        gap="$3"
      >
        <Sheet.Handle backgroundColor={borderColor} />
        
        <YStack gap="$4">
          <Text fontSize={20} fontWeight="600" color={textColor}>
            Color Selection
          </Text>

          <YStack gap="$2">
            <Text fontSize={14} color={textColor}>
              Custom Color
            </Text>
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
                  thumbSize={30}
                  sliderSize={30}
                  noSnap={true}
                  row={false}
                />
              )}
            </View>
          </YStack>

          <XStack gap="$2" alignItems="center">
            <Text fontSize={14} color={textColor}>
              Selected Color:
            </Text>
            <Circle size={34} backgroundColor={selectedColor} />
            <Text fontSize={14} color={textColor}>
              {selectedColor.toUpperCase()}
            </Text>
          </XStack>

          <Button
            backgroundColor={selectedColor}
            height={45}
            width={150}
            pressStyle={{ opacity: 0.8 }}
            onPress={() => onOpenChange(false)}
            alignSelf="flex-end"
          >
            <Text color="#fff" fontWeight="500">
              Done
            </Text>
          </Button>
        </YStack>
      </Sheet.Frame>
    </Sheet>
  )
}

const styles = StyleSheet.create({
  pickerContainer: {
    height: 350,
    width: '100%',
    padding: 20,
  },
})
