import React, { useState, useRef, useEffect } from 'react';
import { Stack, Text, Input, XStack, ScrollView, YStack, Spinner } from 'tamagui';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../store/UserStore';
import { useChatStore } from '../store/ChatStore';
import { AnimatedText } from './AnimatedText';
import { 
  TouchableOpacity, 
  ScrollView as RNScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Keyboard 
} from 'react-native';

export function AIChatbot() {
  const scrollViewRef = useRef<RNScrollView>(null);
  const [message, setMessage] = useState('');
  const username = useUserStore((state) => state.preferences.username);
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { messages, sendMessage, isLoading, currentStreamingMessage, error } = useChatStore();

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    const currentMessage = message;
    setMessage('');
    await sendMessage(currentMessage);
  };

  useEffect(() => {
    if (currentStreamingMessage || messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [currentStreamingMessage, messages]);

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
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
      {messages.length === 0 ? (
        <Stack flex={1} alignItems="center" justifyContent="center">
          <Text color="white" fontSize={20}>
            What can I help you with{username ? `, ${username}` : ''}?
          </Text>
        </Stack>
      ) : (
        <ScrollView 
          flex={1} 
          padding={16}
          paddingTop={80}
          ref={scrollViewRef}
          onContentSizeChange={() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }}
        >
          <YStack space={16}>
            {messages.map((msg, index) => (
              <XStack 
                key={index}
                backgroundColor={msg.role === 'user' ? '$gray12' : '$gray11'}
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
                backgroundColor="$gray11"
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
          </YStack>
        </ScrollView>
      )}
      
      <XStack
        backgroundColor="$gray12"
        borderRadius={28}
        margin={16}
        paddingHorizontal={20}
        paddingVertical={4}
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
          placeholderTextColor="#fff"
          textAlignVertical="center"
          borderWidth={0}
          color="white"
          value={message}
          onChangeText={setMessage}
          onSubmitEditing={() => {
            handleSend();
            Keyboard.dismiss();
          }}
          multiline
          maxHeight={80}
        />
        {isLoading ? (
          <Spinner size="small" color={primaryColor} />
        ) : (
          <TouchableOpacity onPress={handleSend}>
            <Ionicons 
              name="send" 
              size={24} 
              color={primaryColor} 
            />
          </TouchableOpacity>
        )}
      </XStack>
      </Stack>
    </KeyboardAvoidingView>
  );
}
