import React, { useEffect } from 'react'
import { Sheet, Text, Theme, isWeb } from 'tamagui'
import { KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { 
  FadeIn, 
  SlideInUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withDelay,
  interpolate,
  Extrapolate,
  ZoomIn
} from 'react-native-reanimated'

interface BaseCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  snapPoints?: number[]
  position?: number
  dismissOnSnapToBottom?: boolean
  zIndex?: number
}

export function BaseCardAnimated({ 
  open, 
  onOpenChange, 
  title, 
  children,
  snapPoints = isWeb ? [90] : [80],
  position = 0,
  dismissOnSnapToBottom = true,
  zIndex = 100000
}: BaseCardModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const topInset = Platform.OS === 'ios' ? insets.top : 0
  
  // Animation shared values
  const scale = useSharedValue(0.9)
  const rotate = useSharedValue(-2)
  const opacity = useSharedValue(0)
  
  // Reset animations when modal opens
  useEffect(() => {
    if (open) {
      scale.value = 0.9
      rotate.value = -2
      opacity.value = 0
      
      // Animate values when modal opens
      scale.value = withSpring(1, {
        damping: 15,
        stiffness: 100,
      })
      rotate.value = withSpring(0, {
        damping: 20,
        stiffness: 90,
      })
      opacity.value = withTiming(1, { duration: 400 })
    }
  }, [open])
  
  // Create animated styles for the frame
  const frameAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { rotate: `${rotate.value}deg` }
      ],
      opacity: opacity.value
    }
  })

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        position={position}
        dismissOnSnapToBottom={dismissOnSnapToBottom}
        zIndex={zIndex}
        disableDrag={false}
        animation="quick"
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.2)"}
        />
        <Sheet.Frame
          paddingVertical={Platform.OS === 'web' ? "$4" : "$1"}
          paddingHorizontal={Platform.OS === 'web' ? "$6" : "$4"}
          backgroundColor={isDark ? "rgba(17,17,17,1)" : "rgba(250,250,250,0.95)"}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
          gap={Platform.OS === 'web' ? "$1" : "$2"}
          {...(Platform.OS === 'web' ? 
            { 
              maxWidth: 1000, 
              marginHorizontal: 'auto',
              minHeight: 500,
              maxHeight: 'calc(100vh - 80px)',
            } : {}
          )}
          animation="quick"
        >
            <Sheet.Handle backgroundColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"} marginBottom="$4"/>
            <KeyboardAvoidingView 
              behavior={Platform.OS === "ios" ? "padding" : "height"}  
              style={{ flex: 1, paddingTop: Math.max(topInset - 100, 0) }}
            >
              <Animated.View 
                entering={SlideInUp.duration(500).springify().damping(15)} 
                style={{ marginBottom: 12, paddingHorizontal: 6}}
              >
                <Text 
                  fontSize={22}  
                  fontWeight="700"  
                  color={isDark ? "#fff" : "#000"} 
                  opacity={isDark ? 1 : 0.9} 
                  fontFamily="$body"
                > 
                  {title} 
                </Text>
              </Animated.View>
              <Animated.View
                entering={ZoomIn.delay(200).duration(400).springify()}
                style={{ flex: 1 }}
              >
                <Sheet.ScrollView 
                  bounces={false} 
                  showsVerticalScrollIndicator={false}
                  keyboardShouldPersistTaps="handled" 
                  keyboardDismissMode="interactive"
                  contentContainerStyle={Platform.OS === 'web' ? { paddingBottom: 40 } : {}}
                >
                  {children}
                </Sheet.ScrollView>
              </Animated.View>
            </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  )
}
