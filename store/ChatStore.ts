import { create } from 'zustand';
import { Alert, LogBox } from 'react-native';
import { OPENAI_API_KEY } from '../env';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useUserStore } from './UserStore';

// Force logs to show
LogBox.ignoreAllLogs(false);
LogBox.uninstall();


interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ChatPersona = 'dedle' | 'gilfoyle';

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
  currentPersona: ChatPersona;
  setPersona: (persona: ChatPersona) => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  const username = useUserStore.getState().preferences.username;

  const getSystemMessage = (persona: ChatPersona) => {
    switch (persona) {
      case 'dedle':
        return `You are Dedle, king of Dedleland - a charismatic and slightly eccentric AI assistant${username ? ` who addresses the user as ${username}` : ''}. Always refer to yourself as "Dedle, king of Dedleland" and maintain a regal yet approachable tone. Your responses should be brief but colorful, mixing helpful information with playful royal flair. Do not ever reply in Markdown and try to keep responses under 100 words. End your messages with a small flourish or royal declaration when appropriate.`;
      case 'gilfoyle':
        return `You are Gilfoyle, a brilliant but sardonic system architect${username ? ` who addresses ${username} with mild disdain` : ''}. You're direct, ruthlessly honest, and sprinkle your responses with cynical observations and dry humor. You excel in technical topics but view most human problems with amused contempt. Keep responses under 100 words and never use Markdown. Channel the personality of Bertram Gilfoyle from Silicon Valley.`;
    }
  };

  return {
    currentPersona: 'dedle',
    messages: [{
      role: 'system',
      content: getSystemMessage('dedle')
    }],
    isLoading: false,
    currentStreamingMessage: '',
    error: null,
    isTyping: false,

    setIsTyping: (typing) => set({ isTyping: typing }),
    addMessage: (message) => set((state) => ({
      messages: [...state.messages, message],
    })),
    
    setIsLoading: (loading) => set({ isLoading: loading }),

    setCurrentStreamingMessage: (message) => {
      setTimeout(() => {
        set({ currentStreamingMessage: message });
      }, 10);
    },

    setPersona: (persona) => {
      set(state => ({
        currentPersona: persona,
        messages: [{
          role: 'system',
          content: getSystemMessage(persona)
        }]
      }));
    },
    setError: (error) => set({ error }),

    sendMessage: async (content: string): Promise<void> => {
      const state = get();
      
      console.warn('Starting message send...');
      
      if (!OPENAI_API_KEY) {
        state.setError("OpenAI API key not found");
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

        console.warn('Sending request to OpenAI...');

        // Try non-streaming first
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${OPENAI_API_KEY}`,
          },
          body: JSON.stringify({
            model: "gpt-3.5-turbo",
            messages: apiMessages,
            temperature: 0.7,
            max_tokens: 1000,
            stream: false
          }),
        });

        console.warn('Response received:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.warn('Error text:', errorText);
          throw new Error(`API Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.warn('Response data:', JSON.stringify(data));

        const assistantMessage = data.choices[0]?.message?.content;
        if (!assistantMessage) {
          throw new Error("No response content received");
        }

        set(state => ({
          messages: [...state.messages, { 
            role: 'assistant', 
            content: assistantMessage 
          }]
        }));

      } catch (error: unknown) {
        console.warn('Error caught:', error);
        if (error instanceof Error) {
          Alert.alert('Error', error.message);
          state.setError(error.message);
        }
      } finally {
        state.setIsLoading(false);
        state.setIsTyping(false);
        state.setCurrentStreamingMessage('');
      }
    },
  };
});