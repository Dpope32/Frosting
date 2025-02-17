import React, { useState, useCallback, useEffect, forwardRef, useMemo } from 'react'
import { useColorScheme, ScrollView, TextInput } from 'react-native'
import { Text, Button, YStack, XStack, Input, Stack } from 'tamagui'
import { BaseCardModal } from './BaseCardModal'
import { adjustColorBrightness } from '@/store/ChatStore'

interface CustomBotModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreateBot: (name: string, prompt: string, color: string, bgColor?: string) => void
}

const COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#84cc16',
  '#22c55e',
  '#06b6d4',
  '#3b82f6',
  '#6366f1',
  '#a855f7',
  '#ec4899',
]

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState<T>(value)
  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(handler)
  }, [value, delay])
  return debounced
}

type DebouncedInputProps = {
  value: string
  onDebouncedChange: (val: string) => void
  delay?: number
} & Omit<React.ComponentProps<typeof Input>, 'value'>

const DebouncedInput = forwardRef<TextInput, DebouncedInputProps>(
  ({ value, onDebouncedChange, delay = 500, ...props }, ref) => {
    const [text, setText] = useState(value)
    const debouncedText = useDebounce(text, delay)
    useEffect(() => {
      if (debouncedText !== value) {
        onDebouncedChange(debouncedText)
      }
    }, [debouncedText, value, onDebouncedChange])
    return (
      <Input
        ref={ref}
        {...props}
        value={text}
        onChangeText={setText}
      />
    )
  }
)

export function CustomBotModal({ open, onOpenChange, onCreateBot }: CustomBotModalProps) {
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const [botName, setBotName] = useState('')
  const [prompt, setPrompt] = useState('')
  const [selectedColor, setSelectedColor] = useState(COLORS[0])

  const cardStyle = useMemo(() => ({
    backgroundColor: isDark ? "rgba(45,45,45,0.8)" : "rgba(255,255,255,0.8)",
    borderRadius: 12,
    padding: "$4",
    borderWidth: 1,
    borderColor: isDark ? "rgba(85,85,85,0.5)" : "rgba(170,170,170,0.5)",
  }), [isDark])

  const inputStyle = useMemo(() => ({
    backgroundColor: isDark ? "rgba(45,45,45,0.8)" : "rgba(255,255,255,0.8)",
    borderColor: isDark ? "rgba(85,85,85,0.5)" : "rgba(170,170,170,0.5)",
    color: isDark ? "#fff" : "#000",
    fontSize: 14,
    borderRadius: 8,
    padding: "$2",
  }), [isDark])

  useEffect(() => {
    if (!open) {
      setBotName('')
      setPrompt('')
      setSelectedColor(COLORS[0])
    }
  }, [open])

  const handleSubmit = useCallback(() => {
    if (botName && prompt) {
      const bgColor = adjustColorBrightness(selectedColor, -0.3)
      onCreateBot(botName, prompt, selectedColor, bgColor)
      onOpenChange(false)
    }
  }, [botName, prompt, selectedColor, onCreateBot, onOpenChange])

  return (
    <BaseCardModal
      open={open}
      onOpenChange={onOpenChange}
      title="Create Your Custom Bot"
      snapPoints={[90]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        bounces={false}
      >
        <YStack space="$4" paddingHorizontal="$2">
          <YStack {...cardStyle} space="$4">
            <YStack space="$2">
              <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500">
                Bot Name
              </Text>
              <DebouncedInput
                value={botName}
                onDebouncedChange={setBotName}
                placeholder="Enter bot name"
                placeholderTextColor={isDark ? "#aaa" : "#666"}
                {...inputStyle}
              />
            </YStack>
            <YStack space="$2">
              <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500">
                Bot Personality
              </Text>
              <DebouncedInput
                value={prompt}
                onDebouncedChange={setPrompt}
                placeholder="Describe your bot's personality and behavior..."
                placeholderTextColor={isDark ? "#aaa" : "#666"}
                multiline
                numberOfLines={4}
                height={120}
                textAlignVertical="top"
                {...inputStyle}
              />
            </YStack>
            <YStack space="$2">
              <Text color={isDark ? "#fff" : "#000"} fontSize={14} fontWeight="500">
                Bot Color
              </Text>
              <XStack flexWrap="wrap" gap="$2" justifyContent="flex-start">
                {COLORS.map((color) => (
                  <Stack
                    key={color}
                    width={40}
                    height={40}
                    borderRadius={20}
                    backgroundColor={color}
                    pressStyle={{ scale: 0.96 }}
                    borderWidth={2}
                    borderColor={selectedColor === color ? (isDark ? "#fff" : "#000") : "transparent"}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </XStack>
            </YStack>
          </YStack>
          <XStack space="$4" justifyContent="flex-end" marginTop="$2">
            <Button
              backgroundColor={isDark ? "rgba(170,170,170,0.5)" : "rgba(85,85,85,0.5)"}
              borderColor={isDark ? "rgba(170,170,170,0.5)" : "rgba(85,85,85,0.5)"}
              onPress={() => onOpenChange(false)}
              pressStyle={{ opacity: 0.7 }}
            >
              <Text color={isDark ? "#fff" : "#000"}>Cancel</Text>
            </Button>
            <Button
              backgroundColor={selectedColor}
              onPress={handleSubmit}
              disabled={!botName || !prompt}
              opacity={!botName || !prompt ? 0.5 : 1}
              pressStyle={{ opacity: 0.8 }}
            >
              <Text color="#fff" fontWeight="500">Create Bot</Text>
            </Button>
          </XStack>
        </YStack>
      </ScrollView>
    </BaseCardModal>
  )
}