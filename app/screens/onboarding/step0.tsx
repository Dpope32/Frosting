import React, { useRef, useEffect } from 'react'
import { YStack, Input, Label, isWeb } from 'tamagui'
import { Platform, View, Text, Animated, Easing } from 'react-native'
import { FormData } from '@/types/onboarding'
import { LinearGradient } from 'expo-linear-gradient'
import { isIpad } from '@/utils/deviceUtils'
import Svg, { Defs, ClipPath, Rect, Text as SvgText, LinearGradient as SvgLinearGradient, Stop } from 'react-native-svg'

const AnimatedLinearGradient: any = Animated.createAnimatedComponent(LinearGradient as any)
const AnimatedRect = Animated.createAnimatedComponent(Rect)

export default function Step0({
  formData,
  setFormData,
}: {
  formData: FormData
  setFormData: React.Dispatch<React.SetStateAction<FormData>>
}) {
  const translateX = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.loop(
      Animated.timing(translateX, {
        toValue: 1,
        duration: 4000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start()
  }, [])

  // Interpolate translateX to a pixel value for the gradient shift
  const translateGradient = translateX.interpolate({
    inputRange: [0, 1],
    outputRange: ['-100', '100'] 
  })

  const gradientColors = [
    '#b2d7fe',
    '#aad3fe',
    '#c2e0fe',
    '#dbecff',
    '#9acbfe',
    '#d3e8ff',
    '#92c7fe',
    '#cbe4fe',
    '#badcfe',
    '#a2cffe',
    '#00f0ff'
  ]

  return (
    <YStack gap="$2" flex={1} padding={isWeb ? "$4" : "$3"} marginBottom={isWeb ? "$15" : "$10"} justifyContent="center" alignItems="center" maxWidth={500} alignSelf="center" width="100%">
      {isWeb ? (
        <div
          style={{
            width: '100%',
            height: 120,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
            borderRadius: 12,
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              fontSize: 120,
              fontWeight: 'bold',
              fontFamily: 'var(--font-heading, sans-serif)',
              letterSpacing: 2,
              textAlign: 'center',
              width: '100%',
              background: 'linear-gradient(90deg, #b2d7fe, #aad3fe, #c2e0fe, #dbecff, #9acbfe, #d3e8ff, #92c7fe, #cbe4fe, #badcfe, #a2cffe, #00f0ff)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              color: 'transparent',
              textShadow: '0 2px 8px rgba(0,0,0,0.10)',
              userSelect: 'none',
            }}
          >
            Kaiba
          </span>
        </div>
      ) : (
        <View style={{ height: isIpad() ? 130 : 90, width: '100%', justifyContent: 'center', alignItems: 'center' }}>
          <Svg 
            height="100%" 
            width="100%"
            style={{ position: 'absolute' }}
          >
            <Defs>
              <ClipPath id="textClip">
                <SvgText
                  fontSize={isIpad() ? 100 : 60}
                  fontWeight="bold"
                  x="50%"
                  y={isIpad() ? 90 : 60}
                  textAnchor="middle"
                  fill="white"
                >
                  Kaiba
                </SvgText>
              </ClipPath>
              
              <SvgLinearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                {gradientColors.map((color, index) => (
                  <Stop 
                    key={index} 
                    offset={`${index * (100 / (gradientColors.length - 1))}%`} 
                    stopColor={color} 
                  />
                ))}
              </SvgLinearGradient>
            </Defs>
            
            <AnimatedRect
              x={translateGradient}
              y="0"
              width="300%"
              height="100%"
              fill="url(#gradient)"
              clipPath="url(#textClip)"
            />
          </Svg>
          
          <Text
            style={{
              fontSize: isIpad() ? 100 : 60,
              fontWeight: 'bold',
              fontFamily: '$heading',
              color: '$white',
              letterSpacing: 2,
              textAlign: 'center',
              opacity: 0,
              width: '100%',
            }}
          >
            Kaiba
          </Text>
        </View>
      )}
      <Label paddingBottom={isWeb ? 20 : isIpad() ? 12 : 8} fontFamily="$heading" fontWeight={isWeb ? 500 : 800} fontSize={isWeb ? "$9" : 20} textAlign="center" color="$onboardingLabel">
        What should we call you?
      </Label>
      <Input
        size={isWeb ? "$7" : isIpad() ? "$6" : "$5"}
        placeholder="Enter username"
        value={formData.username}
        onChangeText={(text) =>setFormData((prev) => ({ ...prev, username: text }))}
        autoFocus={Platform.OS === 'ios' || Platform.OS === 'android'}
        autoCapitalize="words"
        backgroundColor="transparent"
        borderColor="$onboardingInputBorder"
        autoComplete="off"
        borderWidth={2}
        borderRadius={12}
        autoCorrect={false}
        color="$onboardingInputText"
        fontWeight="700"
        placeholderTextColor="$onboardingPlaceholder"
        fontFamily="$body"
        textAlign="center"
        style={{  textAlign: 'center', alignSelf: 'center',  maxWidth: isWeb ? 350 : isIpad() ? 300 : 250, width: isWeb ? 300 : isIpad() ? 250 : 220, height: isWeb ? 55 : isIpad() ? 50 : 48}}
      />
    </YStack>
  )
}