import React from 'react';
import { YStack, Text, XStack, Circle, Label, isWeb, Image } from 'tamagui'
import { FormData, ColorOption } from '@/types/onboarding'
import { View, useColorScheme, Platform } from 'react-native' 
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { isIpad } from '@/utils/deviceUtils';
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
  const currentColor = formData.primaryColor || (colorOptions.length > 0 ? colorOptions[0].value : '#010101')
  const insets = useSafeAreaInsets();
  const handleColorChange = (color: string) => { setFormData((prev) => ({ ...prev, primaryColor: color }))}

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
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$2"} marginBottom={isWeb ? isIpad() ? "$4" : "$20" : "$20"} justifyContent="center" alignItems="center" maxWidth={500} alignSelf="center" width="100%">
      <YStack alignItems="center" width="100%">
      <XStack 
          position="relative"
          alignSelf="center"
          gap="$2" 
          paddingBottom="$4"
          justifyContent="center"
          alignItems="center"
        >
          {formData.profilePicture ? (
            <Image
              source={{ uri: formData.profilePicture }}
              style={{ width: 56, height: 56, borderRadius: 28, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 4 }}
            />
          ) : (
            <Circle size={56} backgroundColor="$onboardingStep1CircleBackground" style={{ shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.18, shadowRadius: 4, elevation: 4 }}>
              <Text fontFamily="$body" fontSize={24}>👤</Text>
            </Circle>
          )}
          <Text 
            color="$onboardingLabel" 
            fontFamily="$heading" 
            fontWeight="700" 
            fontSize={isWeb ? "$7" : "$7"}
            textAlign="center"
            style={{ lineHeight: 56, height: 56, paddingLeft: 12 }}
          >
            {formData.username}
          </Text>
        </XStack>
        <Label 
            fontFamily="$heading" 
            fontWeight={isWeb ? 500 : 800} 
            fontSize={isWeb ? "$9" : "$7"} 
            textAlign="center" 
            color="$onboardingLabel" 
          >
             Select theme color
          </Label>
      </YStack>
      <YStack width="100%" alignItems="center" marginTop={0}>
        {Platform.OS === 'web' ? (
          <WebColorPicker />
        ) : (
          <View style={{ flex: 1}}>
            <ColorPicker
              color={currentColor}
              onColorChange={handleColorChange}
              thumbSize={18}
              sliderSize={20}
              shadeWheelThumb={true}
              noSnap={true}
              row={false}
              swatches={false}
              sliderHidden={true}
              discrete={true}
            />
          </View>
        )}
      </YStack>
    </YStack>
    
  )
}
