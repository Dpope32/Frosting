import React, { useState, useRef, useEffect } from 'react'
import { Stack, Text, Input, XStack, YStack, Spinner } from 'tamagui'
import { Ionicons } from '@expo/vector-icons'
import { useUserStore } from '@/store/UserStore'
import { useChatStore, type CustomBot, adjustColorBrightness } from '@/store/ChatStore'
import { CustomBotModal } from '@/components/cardModals/CustomBotModal'
import {
  TouchableOpacity,
  ScrollView as RNScrollView,
  Platform,
  Keyboard,
  View,
  Alert,
  useColorScheme
} from 'react-native'

interface ChatErrorBoundaryProps {
  children: React.ReactNode
}

interface ChatErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

class ChatErrorBoundary extends React.Component<ChatErrorBoundaryProps, ChatErrorBoundaryState> {
  constructor(props: ChatErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: Error): ChatErrorBoundaryState {
    return { hasError: true, error }
  }
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Chatbot error boundary caught an error', error, errorInfo)
  }
  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'white', fontSize: 18 }}>Something went wrong.</Text>
        </View>
      )
    }
    return this.props.children
  }
}

const THEME = {
  light: {
    background: '#ffffff',
    inputBg: 'rgba(207, 207, 207, 0.95)',
    inputBorder: 'rgba(0, 0, 0, 0.1)',
    text: '#000000',
    messageBg: {
      user: '#0066CC',
      assistant: '#f0f0f0'
    },
    messageText: {
      user: '#ffffff',
      assistant: '#000000'
    }
  },
  dark: {
    background: '#000000',
    inputBg: 'rgba(48, 48, 48, 0.95)',
    inputBorder: 'rgba(244, 240, 240, 0.1)',
    text: '#ffffff',
    messageBg: {
      user: '#0066CC',
      assistant: '#333333'
    },
    messageText: {
      user: '#ffffff',
      assistant: '#ffffff'
    }
  },
  dedle: {
    primary: '#FFD700',
    secondary: '#FFA500',
    bg: '#2D2A20'
  },
  gilfoyle: {
    primary: '#FF4444',
    secondary: '#8B0000',
    bg: '#2A2020'
  }
}

function ChatbotInner() {
  const scrollViewRef = useRef<RNScrollView>(null)
  const [message, setMessage] = useState('')
  const [keyboardHeight, setKeyboardHeight] = useState(0)
  const [showCustomBotModal, setShowCustomBotModal] = useState(false)
  const username = useUserStore((state) => state.preferences.username)
  const primaryColor = useUserStore((state) => state.preferences.primaryColor)
  const { 
    messages, 
    sendMessage, 
    isLoading, 
    currentStreamingMessage, 
    error, 
    currentPersona, 
    setPersona,
    customBots,
    addCustomBot
  } = useChatStore()
  const colorScheme = useColorScheme()
  const isDark = colorScheme === 'dark'
  const theme = isDark ? THEME.dark : THEME.light

  const handleSend = async () => {
    if (isLoading) return
    const trimmed = message.trim()
    if (!trimmed) {
      Alert.alert('Error', 'Please enter a message')
      return
    }
    setMessage('')
    Keyboard.dismiss()
    try {
      await sendMessage(trimmed)
    } catch (e) {
      console.error(e)
    }
  }

  const handleCreateBot = (name: string, prompt: string, color: string, bgColor?: string) => {
    addCustomBot({ 
      name, 
      prompt, 
      color,
      bgColor
    })
  }

  useEffect(() => {
    const showEvent = Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow'
    const hideEvent = Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide'
    const keyboardShow = Keyboard.addListener(showEvent, (e) => {
      setKeyboardHeight(e.endCoordinates.height)
    })
    const keyboardHide = Keyboard.addListener(hideEvent, () => {
      setKeyboardHeight(0)
    })
    return () => {
      keyboardShow.remove()
      keyboardHide.remove()
    }
  }, [])

  const getErrorMessage = (err: string) => {
    if (err.includes('Error processing stream')) return 'Failed to get response. Please try again.'
    if (err.includes('API key')) return 'API key not configured. Please check settings.'
    if (err.includes('empty response')) return 'No response received. Please try again.'
    return err
  }

  const handleRetry = () => {
    if (messages.length > 1) {
      const lastUserMessage = messages[messages.length - 1]
      if (lastUserMessage.role === 'user') {
        useChatStore.getState().setError(null)
        sendMessage(lastUserMessage.content)
      }
    }
  }

  const handleSelectPersona = () => {
    const defaultOptions = [
      {
        text: '👑 Dedle - Friendly & Professional',
        onPress: () => setPersona('dedle')
      },
      {
        text: '🖥️ Gilfoyle - Sarcastic & Technical',
        onPress: () => setPersona('gilfoyle')
      }
    ]

    const customBotOptions = customBots.map(bot => ({
      text: `🤖 ${bot.name}`,
      onPress: () => setPersona(bot.name)
    }))

    const createBotOption = {
      text: '🎨 Create Custom Bot',
      onPress: () => setShowCustomBotModal(true)
    }

    const cancelOption = {
      text: 'Cancel',
      style: 'cancel' as const
    }

    const options = [...defaultOptions, ...customBotOptions, createBotOption, cancelOption]

    Alert.alert('Select Persona', 'Choose your chat assistant', options)
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack flex={1} backgroundColor={theme.background} position="relative">
        {error && (
          <XStack
            backgroundColor="#AA0000"
            padding={12}
            position="absolute"
            top={100}
            left={16}
            right={16}
            borderRadius={8}
            zIndex={1000}
            alignItems="center"
            justifyContent="center"
            style={{ transform: [{ scale: 1 }] }}
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <Text color="white" flex={1} textAlign="center">
                {getErrorMessage(error)}
              </Text>
              <XStack gap={8}>
                <TouchableOpacity onPress={handleRetry} style={{ marginLeft: 8 }}>
                  <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => useChatStore.getState().setError(null)} style={{ marginLeft: 8 }}>
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </XStack>
            </XStack>
          </XStack>
        )}
        {messages.filter((m) => m.role !== 'system').length === 0 ? (
          <Stack flex={1} alignItems="center" justifyContent="center">
            <Text color={theme.text} fontSize={20}>
              What can I help you with{username ? `, ${username}` : ''}?
            </Text>
          </Stack>
        ) : (
          <RNScrollView
            ref={scrollViewRef}
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 16, paddingTop: 100, paddingBottom: 140 }}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true })
            }}
            showsVerticalScrollIndicator={true}
          >
            <YStack gap={16}>
              {messages.filter((m) => m.role !== 'system').map((msg, idx) => (
                <XStack
                  key={idx}
                  backgroundColor={msg.role === 'user' ? theme.messageBg.user : theme.messageBg.assistant}
                  padding={12}
                  borderRadius={16}
                  alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                  maxWidth="80%"
                >
                  <Text color={msg.role === 'user' ? theme.messageText.user : theme.messageText.assistant} fontSize={16}>
                    {msg.content}
                  </Text>
                </XStack>
              ))}
              {currentStreamingMessage && (
                <XStack
                  backgroundColor={theme.messageBg.assistant}
                  padding={12}
                  borderRadius={16}
                  alignSelf="flex-start"
                  maxWidth="80%"
                >
                  <Text color={theme.messageText.assistant} fontSize={16}>
                    {currentStreamingMessage}
                  </Text>
                </XStack>
              )}
              {isLoading && !currentStreamingMessage && (
                <XStack
                  backgroundColor={theme.messageBg.assistant}
                  padding={12}
                  borderRadius={16}
                  alignSelf="flex-start"
                  height={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="small" color={theme.messageText.assistant} />
                </XStack>
              )}
            </YStack>
          </RNScrollView>
        )}
        <XStack
          backgroundColor={theme.inputBg}
          borderTopLeftRadius={32}
          borderTopRightRadius={32}
          margin={0}
          marginBottom={Platform.OS === 'ios' ? keyboardHeight : 0}
          paddingTop={16}
          paddingBottom={32}
          paddingHorizontal={16}
          alignItems="center"
          borderWidth={1}
          borderColor={theme.inputBorder}
          opacity={isLoading ? 0.7 : 1}
          minHeight={80}
          width="100%"
          position="absolute"
          bottom={0}
          shadowColor={isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.1)"}
          shadowOffset={{ width: 0, height: -2 }}
          shadowOpacity={1}
          shadowRadius={8}
          elevation={5}
        >
          <TouchableOpacity
            onPress={handleSelectPersona}
            style={{
              padding: 8,
              borderRadius: 16,
              backgroundColor:
                currentPersona === 'dedle'
                  ? THEME.dedle.bg
                  : currentPersona === 'gilfoyle'
                  ? THEME.gilfoyle.bg
                  : customBots.find(bot => bot.name === currentPersona)?.bgColor || 'transparent',
              marginRight: 12
            }}
          >
            <Ionicons
              name="person-circle"
              size={28}
              color={
                currentPersona === 'dedle'
                  ? THEME.dedle.primary
                  : currentPersona === 'gilfoyle'
                  ? THEME.gilfoyle.primary
                  : customBots.find(bot => bot.name === currentPersona)?.color || '#666'
              }
            />
          </TouchableOpacity>
          <Input
            flex={1}
            backgroundColor="transparent"
            autoCapitalize="sentences"
            placeholder="Message"
            placeholderTextColor={isDark ? '#666' : '#999'}
            borderWidth={0}
            color={theme.text}
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            multiline
            minHeight={24}
            maxHeight={120}
            editable={!isLoading}
            fontSize={16}
            style={{ textAlignVertical: 'center' }}
          />
          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!message.trim()}
            style={{
              padding: 8,
              marginLeft: 12,
              opacity: message.trim() ? 1 : 0.5
            }}
          >
            <Ionicons name="send" size={32} color={message.trim() ? primaryColor : '#000'} />
          </TouchableOpacity>
        </XStack>
      </Stack>

      <CustomBotModal
        open={showCustomBotModal}
        onOpenChange={setShowCustomBotModal}
        onCreateBot={handleCreateBot}
      />
    </View>
  )
}

export default function Chatbot() {
  return (
    <ChatErrorBoundary>
      <ChatbotInner />
    </ChatErrorBoundary>
  )
}
