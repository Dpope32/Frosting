import React from 'react';
import { YStack, Text, XStack, Circle, Label, isWeb } from 'tamagui'
import { FormData, ColorOption } from '@/types'
import { View, useColorScheme, Platform } from 'react-native'

const EmptyColorPicker = () => null;

import WheelColorPicker from 'react-native-wheel-color-picker';

const ColorPicker = Platform.OS === 'web' ? EmptyColorPicker : WheelColorPicker;

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
  const currentColor = formData.primaryColor || (colorOptions.length > 0 ? colorOptions[0].value : '#000000')
  const labelColor = isDark ? "$gray12Dark" : "$gray12Light";
  const subTextColor = isDark ? "$gray9Dark" : "$gray9Light";
  const borderColor = isDark ? "$gray8Dark" : "$gray8Light";
  const handleColorChange = (color: string) => { setFormData((prev) => ({ ...prev, primaryColor: color }))}

  const WebColorPicker = () => {
    const colorPalette = [
      '#C62828', '#AD1457', '#8E24AA', '#5E35B1', '#3949AB', '#1976D2', '#0288D1', '#0097A7', 
      '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#E64A19',
      '#546E7A', '#78909C', '#B0BEC5','#9d9d9d', '#000000','#090909', '#4B0082', '#311432','#090109',
    ];
    
    return (
      <YStack flex={1} alignItems="center" justifyContent="center" gap="$2">
        <YStack>
          <XStack flexWrap="wrap" justifyContent="center" alignItems="center" marginBottom={isWeb? "$4" : "$1"} maxWidth={320}>
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
        
        {/* Only show custom color picker on web, hidden on mobile */}
        {isWeb && (
          <XStack alignItems="center" gap="$2" style={{ opacity: 0 }}>
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
                  opacity: 1.0, // Make it visible
                  position: 'absolute',
                }}
              />
            </Circle>
          </XStack>
        )}
      </YStack>
    )
  }

  return (
    <YStack gap="$1" flex={1} justifyContent="flex-start" alignItems="center" padding="$5" paddingTop="$8">
      <YStack 
        position="absolute" 
        top={isWeb ? "20%" : "35%"} 
        left={0} 
        right={0} 
        alignItems="center"
        py={isWeb ? "$4" : "$0"}
        br={isWeb ? "$4" : 0}
        my={isWeb ? "$2" : 0}
      >
        <Label 
          paddingBottom={20} 
          fontFamily="$heading" 
          fontWeight="500" 
          fontSize={isWeb ? "$9" : "$7"} 
          textAlign="center" 
          color={labelColor}
        >
          Pick your primary color
        </Label>
        <Text
          fontFamily="$body"
          fontSize="$3"
          textAlign="center"
          color={isWeb ? "#CCCCCC" : subTextColor}
          opacity={0.8}
          fontWeight="400"
        >
          (yes you can change this later)
        </Text>
      </YStack>

      <YStack flex={1} paddingTop={isWeb ? "$10" : "$8"}>
        {Platform.OS === 'web' ? (
          <WebColorPicker />
        ) : (
          <View style={{ flex: 1, padding: isWeb ? 0 : 50 }}>
            <ColorPicker
              color={currentColor}
              onColorChange={handleColorChange}
              thumbSize={30}
              sliderSize={30}
              noSnap={true}
              row={false}
              swatches={false}
              sliderHidden={true}
              discrete={true}
            />
          </View>
        )}
      </YStack>

      <XStack gap="$2" alignItems="center" justifyContent="center">
        <Circle size={50} backgroundColor={currentColor} />
        <Text fontFamily="$body" fontSize={16} color={textColor}>
          {currentColor.toUpperCase()}
        </Text>
      </XStack>
    </YStack>
  )
}