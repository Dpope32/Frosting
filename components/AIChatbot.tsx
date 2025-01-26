import React, { useState, useRef, useEffect } from 'react';
import { Stack, Text, Input, XStack, ScrollView, YStack, Spinner } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/UserStore';
import { useChatStore } from '../store/ChatStore';
import { AnimatedText } from './AnimatedText';
import { 
  TouchableOpacity, 
  ScrollView as RNScrollView, 
  Platform,
  Keyboard,
  View
} from 'react-native';

export function AIChatbot() {
  const scrollViewRef = useRef<RNScrollView>(null);
  const [message, setMessage] = useState('');
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const username = useUserStore((state) => state.preferences.username);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { messages, sendMessage, isLoading, currentStreamingMessage, error } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const currentMessage = message;
    setMessage('');
    Keyboard.dismiss();
    await sendMessage(currentMessage);
  };

  // Auto scroll when messages change or when streaming
  useEffect(() => {
    const scrollToBottom = () => {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100); // Small delay to ensure content is rendered
    };
    
    scrollToBottom();
  }, [currentStreamingMessage, messages]);

  // Keyboard handling
  useEffect(() => {
    const keyboardWillShow = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (e) => setKeyboardHeight(e.endCoordinates.height)
    );
    
    const keyboardWillHide = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => setKeyboardHeight(0)
    );

    return () => {
      keyboardWillShow.remove();
      keyboardWillHide.remove();
    };
  }, []);

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
          >
            <XStack flex={1} alignItems="center" justifyContent="space-between">
              <Text color="white" flex={1} textAlign="center">
                {error}
              </Text>
              <TouchableOpacity 
                onPress={() => useChatStore.getState().setError(null)}
                style={{ marginLeft: 8 }}
              >
                <Ionicons name="close" size={24} color="white" />
              </TouchableOpacity>
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
                    <Text color="white" fontSize={16}>
                      {msg.content}
                    </Text>
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
                  <AnimatedText 
                    text={currentStreamingMessage}
                    color="white"
                    fontSize={16}
                  />
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
          backgroundColor="$gray12"
          borderRadius={28}
          margin={16}
          marginBottom={Platform.OS === 'ios' ? keyboardHeight + 16 : 16}
          paddingHorizontal={24}
          alignItems="center"
          borderWidth={1}
          borderColor="$gray11"
          opacity={1}
          elevation={2}
        >
          <Ionicons name="attach" size={24} color="#666" />
          <Input
            flex={1}
            marginHorizontal={12}
            backgroundColor="transparent"
            placeholder="Message"
            placeholderTextColor="$gray10"
            textAlignVertical="center"
            borderWidth={0}
            color="$gray10Dark"
            value={message}
            onChangeText={setMessage}
            onSubmitEditing={handleSend}
            multiline
            maxHeight={80}
          />
          {isLoading ? (
            <Spinner size="small" color={primaryColor} />
          ) : (
            <TouchableOpacity 
              onPress={handleSend}
              activeOpacity={0.7}
            >
              <Ionicons 
                name="send" 
                size={24} 
                color={primaryColor} 
              />
            </TouchableOpacity>
          )}
        </XStack>
      </Stack>
    </View>
  );
}