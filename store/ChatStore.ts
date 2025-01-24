import { create } from 'zustand';
import OpenAI from 'openai';
import { OPENAI_API_KEY } from '../env';

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key is not set. Please set EXPO_PUBLIC_OPENAI_API_KEY in your environment.');
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessage: string;
  error: string | null;
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  sendMessage: (content: string) => Promise<void>;
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  isLoading: false,
  currentStreamingMessage: '',
  error: null,

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  setIsLoading: (loading) => set({ isLoading: loading }),

  setCurrentStreamingMessage: (message) =>
    set({ currentStreamingMessage: message }),

  setError: (error) => set({ error }),

  sendMessage: async (content) => {
    const state = get();
    state.setIsLoading(true);
    state.addMessage({ role: 'user', content });

    try {
      const stream = await openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          ...state.messages.map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        ],
        stream: true,
      });

      let fullResponse = '';
      
      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullResponse += content;
        state.setCurrentStreamingMessage(fullResponse);
      }

      state.addMessage({
        role: 'assistant',
        content: fullResponse,
      });
      state.setCurrentStreamingMessage('');
    } catch (error: any) {
      console.error('Error sending message:', error);
      if (error.message.includes("API key")) {
        state.setError("OpenAI API key not found. Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file.");
      } else {
        state.setError(error.message || "An error occurred while sending the message.");
      }
    } finally {
      state.setIsLoading(false);
    }
  },
}));
