import React from 'react'
import { Sheet, Text, Theme } from 'tamagui'
import { KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'

interface BaseCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  snapPoints?: number[]
  position?: number
  dismissOnSnapToBottom?: boolean
}

export function BaseCardModal({ 
  open, 
  onOpenChange, 
  title, 
  children,
  snapPoints = [80],
  position = 0,
  dismissOnSnapToBottom = true
}: BaseCardModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const topInset = Platform.OS === 'ios' ? insets.top : 0

  return (
    <Theme name={isDark ? "dark" : "light"}>
      <Sheet
        modal
        open={open}
        onOpenChange={onOpenChange}
        snapPoints={snapPoints}
        position={position}
        dismissOnSnapToBottom={dismissOnSnapToBottom}
        zIndex={100000}
        disableDrag={false}
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.15)"}
        />
        <Sheet.Frame
          paddingVertical="$6"
          paddingHorizontal={Platform.OS === 'web' ? "$6" : "$3"}
          backgroundColor={isDark ? "rgba(17,17,17,0.95)" : "rgba(250,250,250,0.95)"}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
          gap="$6"
          {...(Platform.OS === 'web' ? { maxWidth: 1500, marginHorizontal: 'auto' } : {})}
        >
          <Sheet.Handle
            backgroundColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"}
            marginBottom="$4"
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, paddingTop: Math.max(topInset - 100, 0) }}
          >
            <Animated.View entering={FadeIn.duration(400)} style={{ marginBottom: 16 }}>
              <Text
                fontSize={22}
                fontWeight="700"
                color={isDark ? "#fff" : "#000"}
                opacity={isDark ? 1 : 0.9}
              >
                {title}
              </Text>
            </Animated.View>
            <Sheet.ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
            >
              {children}
            </Sheet.ScrollView>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  )
}
