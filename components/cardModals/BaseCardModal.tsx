import React from 'react'
import { Sheet, Text } from 'tamagui'
import { KeyboardAvoidingView, Platform } from 'react-native'

interface BaseCardModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  children: React.ReactNode
}

export function BaseCardModal({ open, onOpenChange, title, children }: BaseCardModalProps) {
  return (
    <Sheet
      modal
      open={open}
      onOpenChange={onOpenChange}
      snapPoints={[80]}
      position={0}
      dismissOnSnapToBottom
      zIndex={100000}
    >
      <Sheet.Overlay
        animation="quick"
        enterStyle={{ opacity: 0 }}
        exitStyle={{ opacity: 0 }}
        backgroundColor="rgba(0,0,0,0.5)"
      />
      <Sheet.Frame
        padding="$5"
        backgroundColor="rgba(17,17,17,1)"
        borderTopLeftRadius={20}
        borderTopRightRadius={20}
        borderWidth={1}
        borderColor="rgba(255,255,255,0.1)"
      >
        <Sheet.Handle backgroundColor="rgba(255,255,255,0.2)" marginBottom="$4" />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <Text fontSize={22} fontWeight="700" color="#fff" marginBottom="$4">
            {title}
          </Text>
          <Sheet.ScrollView bounces={false}>
            {children}
          </Sheet.ScrollView>
        </KeyboardAvoidingView>
      </Sheet.Frame>
    </Sheet>
  )
}