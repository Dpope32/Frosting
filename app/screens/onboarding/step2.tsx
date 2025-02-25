import { YStack, Text, XStack, Circle, Label } from 'tamagui'
import { FormData, ColorOption } from '@/types'
import { View, useColorScheme, Platform } from 'react-native'

// Define a default empty component for ColorPicker
const EmptyColorPicker = () => null;

// Only try to import the color picker on native platforms
// This approach prevents the bundler from even trying to resolve the package on web
let ColorPicker: any = EmptyColorPicker;

// We use this pattern to completely avoid the import on web
// The bundler won't even try to resolve the package
if (Platform.OS !== 'web') {
  try {
    // Dynamic import that will be completely ignored on web
    const wheelPickerModule = 'react-native-wheel-color-picker';
    // @ts-ignore - This is intentional to prevent web bundling issues
    ColorPicker = require(wheelPickerModule).default;
  } catch (error) {
    console.warn('Color picker not available:', error);
    ColorPicker = EmptyColorPicker;
  }
}

export default function Step2({
  formData,
  setFormData,
  colorOptions,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
  colorOptions: ColorOption[]
}) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const textColor = isDark ? '#fff' : '#000'

  // Use current color or default to first color option
  const currentColor = formData.primaryColor || (colorOptions.length > 0 ? colorOptions[0].value : '#000000')

  const handleColorChange = (color: string) => {
    setFormData((prev) => ({ ...prev, primaryColor: color }))
  }

  // Enhanced Web Color Picker with predefined palette + custom input
  const WebColorPicker = () => {
    // Common color palette
    const colorPalette = [
      '#FF5252', '#FF4081', '#E040FB', '#7C4DFF', 
      '#536DFE', '#448AFF', '#40C4FF', '#18FFFF',
      '#64FFDA', '#69F0AE', '#B2FF59', '#EEFF41',
      '#FFFF00', '#FFD740', '#FFAB40', '#FF6E40',
      '#455A64', '#607D8B', '#9E9E9E', '#FFFFFF',
    ]

    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
        {/* Color swatches grid */}
        <YStack>
          <XStack flexWrap="wrap" justifyContent="center" alignItems="center" marginBottom="$4" maxWidth={320}>
            {colorPalette.map((color, index) => (
              <Circle 
                key={index}
                size={50} 
                backgroundColor={color}
                margin="$2"
                pressStyle={{ scale: 0.95 }}
                hoverStyle={{ scale: 1.05 }}
                onPress={() => handleColorChange(color)}
                borderWidth={currentColor === color ? 3 : 0}
                borderColor={isDark ? "white" : "black"}
                opacity={currentColor === color ? 1 : 0.85}
              />
            ))}
          </XStack>
        </YStack>
        
        {/* Hidden native color input for advanced picking */}
        <XStack alignItems="center" gap="$2">
          <Circle size={50} overflow="hidden">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => handleColorChange(e.target.value)}
              style={{ 
                width: '70px', 
                height: '70px',
                border: 'none',
                cursor: 'pointer',
                opacity: 0.0,
                position: 'absolute',
              }}
            />
            <Circle 
              size={50} 
              backgroundColor={currentColor}
              borderWidth={2}
              borderColor={isDark ? "$gray8Dark" : "$gray8Light"}
            />
          </Circle>
          <Text fontSize={14} color={isDark ? "$gray11Dark" : "$gray11Light"}>
            Click to pick custom color
          </Text>
        </XStack>
      </YStack>
    )
  }

  return (
    <YStack gap="$1" flex={1} justifyContent="flex-start" alignItems="center" padding="$5" paddingTop="$15">
      <YStack position="absolute" top="25%" left={0} right={0} alignItems="center">
        <Label size="$8" textAlign="center" color="$gray12Dark">
          Pick your primary color
        </Label>
        <Text
          fontSize="$3"
          textAlign="center"
          color="$gray9Dark"
          opacity={0.8}
          fontWeight="400"
        >
          (yes you can change this later)
        </Text>
      </YStack>

      {/* Color Picker - Platform specific */}
      <YStack flex={1} paddingTop="$4">
        {Platform.OS === 'web' ? (
          <WebColorPicker />
        ) : (
          <View style={{ flex: 1, padding: 20 }}>
            <ColorPicker
              color={currentColor}
              onColorChange={handleColorChange}
              thumbSize={30}
              sliderSize={30}
              noSnap={true}
              row={false}
            />
          </View>
        )}
      </YStack>

      <XStack gap="$2" alignItems="center" justifyContent="center">
        <Circle size={50} backgroundColor={currentColor} />
        <Text fontSize={16} color={textColor}>
          {currentColor.toUpperCase()}
        </Text>
      </XStack>
    </YStack>
  )
}