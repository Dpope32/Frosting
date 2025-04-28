import React from 'react'
import { Sheet, Text, Theme, isWeb, Button, XStack } from 'tamagui'
import { KeyboardAvoidingView, Platform, useColorScheme } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Animated, { FadeIn } from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'

interface BaseCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
  snapPoints?: number[]
  position?: number
  dismissOnSnapToBottom?: boolean
  zIndex?: number
  showCloseButton?: boolean
  hideHandle?: boolean
}

export function BaseCardModal({
  open,
  onOpenChange,
  title,
  children,
  snapPoints = isWeb ? [95] : [82],
  position = 0,
  dismissOnSnapToBottom = true,
  zIndex = 100000,
  showCloseButton = false,
  hideHandle = false
}: BaseCardModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const insets = useSafeAreaInsets()
  const topInset = Platform.OS === 'ios' ? insets.top : 0
  const handleClose = () => {onOpenChange(false)}

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
      >
        <Sheet.Overlay
          animation="quick"
          enterStyle={{ opacity: 0 }}
          exitStyle={{ opacity: 0 }}
          backgroundColor={isDark ? "rgba(14, 14, 14, 0.3)" : "rgba(0,0,0,0.15)"}
        />
        <Sheet.Frame
          py={Platform.OS === 'web' ? "$2" : "$2"}
          paddingHorizontal={Platform.OS === 'web' ? "$6" : "$4"}
          backgroundColor={isDark ? "rgb(16, 16, 16)" : "rgba(250,250,250,0.95)"}
          borderTopLeftRadius={20}
          borderTopRightRadius={20}
          borderWidth={1}
          borderColor={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.06)"}
          gap={Platform.OS === 'web' ? "$1" : "$1"}
          {...(Platform.OS === 'web' ?
            {
              maxWidth: 1000,
              marginHorizontal: 'auto',
              minHeight: 500,
              maxHeight: 'calc(100vh)',
            } : {}
          )}
        >
          {!hideHandle && <Sheet.Handle backgroundColor={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.08)"} marginBottom="$4"/>}
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : "height"}
            style={{ flex: 1, paddingTop: Math.max(topInset - 80, 0) }}
          >
            <Animated.View entering={FadeIn.duration(400)} style={{ marginTop: hideHandle ? 12 : 12, marginBottom: 12, paddingHorizontal: 6}}>
              <XStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize={22}
                  fontWeight="700"
                  color={isDark ? "#fff" : "#000"}
                  opacity={isDark ? 1 : 0.9}
                  fontFamily="$body"
                >
                  {title}
                </Text>
                {showCloseButton && (
                  <Button
                    backgroundColor="transparent"
                    onPress={handleClose}
                    padding="$1"
                    pressStyle={{ opacity: 0.7 }}
                    icon={<MaterialIcons name="close" size={24} color={isDark ? "#fff" : "#000"}/>}
                  />
                )}
              </XStack>
            </Animated.View>
            <Sheet.ScrollView
              bounces={false}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              contentContainerStyle={Platform.OS === 'web' ? { paddingBottom: 40 } : {}}
            >
              {children}
            </Sheet.ScrollView>
          </KeyboardAvoidingView>
        </Sheet.Frame>
      </Sheet>
    </Theme>
  )
}