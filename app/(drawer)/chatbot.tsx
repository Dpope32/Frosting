import React, { useState, useRef, useEffect } from 'react';
import { Stack, Text, Input, XStack, ScrollView, YStack, Spinner } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '@/store/UserStore';
import { useChatStore } from '@/store/ChatStore';
import {
  TouchableOpacity,
  ScrollView as RNScrollView,
  Platform,
  Keyboard,
  View,
  Alert
} from 'react-native';


const THEME = {
  inputBg: '#222222',
  inputBorder: '#383838',
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
};

export default function Chatbot() {
  const scrollViewRef = useRef<RNScrollView>(null);
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const username = useUserStore((state) => state.preferences.username);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { messages, sendMessage, isLoading, currentStreamingMessage, error, currentPersona, setPersona } = useChatStore();

  const handleSend = async () => {
    if (isLoading) return;
  
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      Alert.alert('Error', 'Please enter a message');
      return;
    }
  
    setMessage('');
    Keyboard.dismiss();
    try {
      await sendMessage(trimmedMessage);
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  // Keyboard handling
  useEffect(() => {
    console.log('Keyboard effect mounted');
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => {
        console.log('Keyboard will show with height:', e.endCoordinates.height);
        setKeyboardHeight(e.endCoordinates.height);
      }
    );

    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        console.log('Keyboard will hide');
        setKeyboardHeight(0);
      }
    );

    return () => {
      console.log('Keyboard listeners removed');
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

  const getErrorMessage = (error: string) => {
    if (error.includes("Error processing stream")) {
      return "Failed to get response. Please try again.";
    }
    if (error.includes("API key")) {
      return "API key not configured. Please check settings.";
    }
    if (error.includes("empty response")) {
      return "No response received. Please try again.";
    }
    return error;
  };

  const handleRetry = () => {
    if (messages.length > 1) {
      const lastUserMessage = messages[messages.length - 1];
      if (lastUserMessage.role === 'user') {
        useChatStore.getState().setError(null);
        sendMessage(lastUserMessage.content);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Stack flex={1} backgroundColor="#1a1a1a" position="relative">
        {error && (
          <XStack
            backgroundColor="$red10"
            padding={12}
            position="absolute"
            top={100}
            left={16}
            right={16}
            borderRadius={8}
            zIndex={1000}
            alignItems="center"
            justifyContent="center"
            animation="bouncy"
            enterStyle={{ opacity: 0, scale: 0.9 }}
            exitStyle={{ opacity: 0, scale: 0.9 }}
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <Text color="white" flex={1} textAlign="center">
                {getErrorMessage(error)}
              </Text>
              <XStack gap={8}>
                <TouchableOpacity
                  onPress={handleRetry}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="refresh" size={24} color="white" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => useChatStore.getState().setError(null)}
                  style={{ marginLeft: 8 }}
                >
                  <Ionicons name="close" size={24} color="white" />
                </TouchableOpacity>
              </XStack>
            </XStack>
          </XStack>
        )}

        {messages.filter(msg => msg.role !== 'system').length === 0 ? (
          <Stack flex={1} alignItems="center" justifyContent="center">
            <Text color="white" fontSize={20}>
              What can I help you with{username ? `, ${username}` : ''}?
            </Text>
          </Stack>
        ) : (
          <ScrollView
            flex={1}
            padding={16}
            paddingTop={100}
            paddingBottom={140}
            ref={scrollViewRef}
            onContentSizeChange={() => {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }}
            showsVerticalScrollIndicator={true}
          >
            <YStack gap={16}>
              {messages
                .filter(msg => msg.role !== 'system')
                .map((msg, index) => (
                  <XStack
                    key={index}
                    backgroundColor={msg.role === 'user' ? '$blue9' : '#333'}
                    padding={12}
                    borderRadius={16}
                    alignSelf={msg.role === 'user' ? 'flex-end' : 'flex-start'}
                    maxWidth="80%"
                  >
                    {msg.role === 'user' ? (
                      <Text color="white" fontSize={16}>
                        {msg.content}
                      </Text>
                    ) : (
                      <Text
                        color="white"
                        fontSize={16}
                      >
                        {msg.content}
                      </Text>
                    )}
                  </XStack>
                ))}
              {currentStreamingMessage && (
                <XStack
                  backgroundColor="#333"
                  padding={12}
                  borderRadius={16}
                  alignSelf="flex-start"
                  maxWidth="80%"
                >
                  <Text
                    color="white"
                    fontSize={16}
                  >
                    {currentStreamingMessage}
                  </Text>
                </XStack>
              )}
              {isLoading && !currentStreamingMessage && (
                <XStack
                  backgroundColor="#333"
                  padding={12}
                  borderRadius={16}
                  alignSelf="flex-start"
                  height={40}
                  alignItems="center"
                  justifyContent="center"
                >
                  <Spinner size="small" color="white" />
                </XStack>
              )}
            </YStack>
          </ScrollView>
        )}

        <XStack
          backgroundColor={THEME.inputBg}
          borderRadius={20}
          margin={16}
          marginBottom={Platform.OS === 'ios' ? keyboardHeight + 16 : 16}
          paddingVertical={12}
          paddingHorizontal={12}
          alignItems="flex-end"
          borderWidth={1}
          borderColor={THEME.inputBorder}
          opacity={isLoading ? 0.7 : 1}
          minHeight={50}
        >
          <TouchableOpacity
            onPress={() => {
              Alert.alert(
                'Select Persona',
                'Choose your chat assistant',
                [
                  {
                    text: '👑 Dedle - Friendly & Professional',
                    onPress: () => setPersona('dedle')
                  },
                  {
                    text: '🖥️ Gilfoyle - Sarcastic & Technical',
                    onPress: () => setPersona('gilfoyle')
                  }
                ],
                { cancelable: true }
              );
            }}
            style={{
              padding: 6,
              borderRadius: 12,
              backgroundColor: currentPersona === 'dedle' ? THEME.dedle.bg : 
                             currentPersona === 'gilfoyle' ? THEME.gilfoyle.bg : 
                             'transparent',
              marginRight: 8
            }}
          >
            <Ionicons 
              name="person-circle" 
              size={24} 
              color={currentPersona === 'dedle' ? THEME.dedle.primary : 
                     currentPersona === 'gilfoyle' ? THEME.gilfoyle.primary : 
                     '#666'} 
            />
          </TouchableOpacity>

          <Input
            flex={1}
            backgroundColor="transparent"
            placeholder="Message"
            placeholderTextColor="#666"
            borderWidth={0}
            color="white"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            multiline
            minHeight={24}
            maxHeight={120}
            editable={!isLoading}
            fontSize={16}
            paddingVertical={0}
            lineHeight={20}
            alignContent='center'
            alignSelf='center'
          />

          <TouchableOpacity
            onPress={handleSend}
            activeOpacity={0.7}
            disabled={!message.trim()}
            style={{
              padding: 6,
              marginLeft: 8,
              opacity: message.trim() ? 1 : 0.5,
              alignSelf: 'flex-end'
            }}
          >
            <Ionicons
              name="send"
              size={24}
              color={message.trim() ? primaryColor : '#666'}
            />
          </TouchableOpacity>
        </XStack>
      </Stack>
    </View>
  );
}