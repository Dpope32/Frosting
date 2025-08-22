import React from 'react';
import { YStack, Text, XStack, Circle, Label, isWeb } from 'tamagui'
import { FormData, ColorOption } from '@/types'
import { View, useColorScheme, Platform } from 'react-native' 
import { isIpad } from '@/utils';
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
  const defaultColor = isDark ? '#ffffff' : '#1976D2' 
  const baseColor = formData.primaryColor || (colorOptions.length > 0 ? colorOptions[0].value : defaultColor);
  const currentColor = baseColor; 
  
  const handleColorChange = (color: string) => { 
    console.log('🎨 Color selected on wheel:', color)
    setFormData((prev) => {
      console.log('🎨 Setting formData.primaryColor to:', color)
      return { ...prev, primaryColor: color }
    })
  }

  const WebColorPicker = () => {
    const colorPalette = [
      '#C62828', '#AD1457', '#8E24AA', '#5E35B1', '#3949AB', '#1976D2', '#0288D1', '#0097A7', 
      '#00897B', '#43A047', '#7CB342', '#C0CA33', '#FDD835', '#FFB300', '#FB8C00', '#E64A19',
      '#546E7A', '#78909C', '#B0BEC5','#9d9d9d', '#010101','#090909', '#4B0082', '#311432','#090109',
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
                  opacity: 1.0,
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
    <YStack gap="$1.5" flex={1} padding={isWeb ? "$4" : "$2"} marginBottom={isWeb ? isIpad() ? "$4" : "$20" : 250} justifyContent="center" alignItems="center" maxWidth={500} alignSelf="center" width="100%">
        <XStack 
          position="relative"
          alignSelf="center"
          gap="$1" 
          justifyContent="center"
          alignItems="center"
        >
        <Text 
          color={currentColor}
          fontFamily="$heading" 
          fontWeight="700" 
          fontSize={isWeb ? "$8" : "$6"}
          textAlign="center"
          style={{ lineHeight: 56, height: 56, paddingLeft: 12 }}
        >
          {formData.username}!
        </Text>

        <Label 
          fontFamily="$heading" 
          fontWeight={isWeb ? 500 : 800} 
          fontSize={isWeb ? "$8" : "$6"} 
          textAlign="center" 
          color={isDark ? "#ffffff" : "#000000"} 
          px="$1.5"
        >
          Select your theme
        </Label>
      </XStack>
      <YStack width="100%" alignItems="center" marginTop={-10}>
        {Platform.OS === 'web' ? (
          <WebColorPicker />
        ) : (
          <View style={{ flex: 1}}>
            <ColorPicker
              color={currentColor}
              onColorChange={handleColorChange}
              thumbSize={18}
              sliderSize={20}
              shadeWheelThumb={false}
              noSnap={false}
              row={false}
              swatches={false}
              sliderHidden={false}
              discrete={false}
            />
          </View>
        )}
      </YStack>
    </YStack>
  )
}
