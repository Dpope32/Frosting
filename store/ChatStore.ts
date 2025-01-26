import { create } from 'zustand';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../env';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useUserStore } from './UserStore';

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
  baseURL: 'https://api.openai.com/v1',
  defaultHeaders: {
    'Content-Type': 'application/json',
  },
  defaultQuery: undefined,
});

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessage: string;
  error: string | null;
  isTyping: boolean;
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  setIsTyping: (typing: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
}

export const useChatStore = create<ChatState>((set, get) => {
  const username = useUserStore.getState().preferences.username;
  
  return {
    messages: [{
      role: 'system',
      content: `You are a concise and friendly AI assistant${username ? ` who addresses the user as ${username}` : ''}. Your responses are brief but helpful, always aiming to answer questions in as few words as possible while maintaining a warm tone. Avoid lengthy explanations unless specifically requested.`
    }],
    isLoading: false,
    currentStreamingMessage: '',
    error: null,
    isTyping: false,

    setIsTyping: (typing) => {
      console.log('Setting typing state:', typing);
      set({ isTyping: typing });
    },

    addMessage: (message) => {
      console.log('Adding message:', message);
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    setIsLoading: (loading) => {
      console.log('Setting loading state:', loading);
      set({ isLoading: loading });
    },

    setCurrentStreamingMessage: (message) => {
      console.log('Setting streaming message:', message.slice(-20));
      set({ currentStreamingMessage: message });
    },

    setError: (error) => {
      console.log('Setting error:', error);
      set({ error });
    },

    sendMessage: async (content) => {
      console.log('Sending message:', content);
      const state = get();
      
      if (!OPENAI_API_KEY) {
        state.setError("OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file.");
        return;
      }

      state.setIsLoading(true);
      state.setIsTyping(true);
      
      try {
        const userMessage: Message = { role: 'user', content };
        const updatedMessages = [...state.messages, userMessage];
        set({ messages: updatedMessages });
        
        const apiMessages: ChatCompletionMessageParam[] = updatedMessages.map(msg => ({
          role: msg.role,
          content: msg.content
        }));
        
        const stream = await openai.chat.completions.create({
          model: "GPT-4o-mini",
          messages: apiMessages,
          temperature: 0.7,
          max_tokens: 3000,
          stream: true
        });

        let fullResponse = '';
        
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          fullResponse += content;
          state.setCurrentStreamingMessage(fullResponse);
        }

        set(state => ({
          messages: [...state.messages, { 
            role: 'assistant', 
            content: fullResponse 
          }]
        }));
        state.setCurrentStreamingMessage('');

      } catch (error: any) {
        console.error('Error in sendMessage:', error);
        if (error.message.includes("API key")) {
          state.setError("OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file.");
        } else {
          state.setError(error.message || "An error occurred while sending the message.");
        }
      } finally {
        state.setIsLoading(false);
        state.setIsTyping(false);
        state.setCurrentStreamingMessage('');
      }
    },
  };
});