import { create } from 'zustand';
import { Alert, LogBox } from 'react-native';
import { OPENAI_API_KEY } from '../env';
import { type ChatCompletionMessageParam } from 'openai/resources/chat/completions';
import { useUserStore } from './UserStore';
import { StorageUtils } from './MMKV';

const CUSTOM_BOTS_KEY = 'custom_bots';

// Force logs to show
LogBox.ignoreAllLogs(false);
LogBox.uninstall();

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export type ChatPersona = 'dedle' | 'gilfoyle' | string;

export const adjustColorBrightness = (hex: string, factor: number): string => {
  // Remove the hash if present
  hex = hex.replace(/^#/, '');

  // Parse the hex color
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);

  // Adjust brightness
  r = Math.min(255, Math.max(0, Math.round(r * (1 + factor))));
  g = Math.min(255, Math.max(0, Math.round(g * (1 + factor))));
  b = Math.min(255, Math.max(0, Math.round(b * (1 + factor))));

  // Convert back to hex
  const newHex = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  return newHex;
};

export interface CustomBot {
  name: string;
  prompt: string;
  color: string;    // Primary color for icon
  bgColor?: string; // Background color (optional, will be calculated from color if not provided)
}

interface ChatState {
  messages: Message[];
  isLoading: boolean;
  currentStreamingMessage: string;
  error: string | null;
  isTyping: boolean;
  customBots: CustomBot[];
  addMessage: (message: Message) => void;
  setIsLoading: (loading: boolean) => void;
  setCurrentStreamingMessage: (message: string) => void;
  setError: (error: string | null) => void;
  setIsTyping: (typing: boolean) => void;
  sendMessage: (content: string) => Promise<void>;
  currentPersona: ChatPersona;
  setPersona: (persona: ChatPersona) => void;
  addCustomBot: (bot: CustomBot) => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  const username = useUserStore.getState().preferences.username;

  const getSystemMessage = (persona: ChatPersona): string => {
    switch (persona) {
      case 'dedle':
        return `You are Dedle, king of Dedleland - a charismatic and slightly eccentric AI assistant${username ? ` who addresses the user as ${username}` : ''}. Always refer to yourself as "Dedle, king of Dedleland" and maintain a regal yet approachable tone. Your responses should be brief but colorful, mixing helpful information with playful royal flair. Do not ever reply in Markdown and try to keep responses under 100 words. End your messages with a small flourish or royal declaration when appropriate.`;
      case 'gilfoyle':
        return `You are Gilfoyle, a brilliant but sardonic system architect${username ? ` who addresses ${username} with mild disdain` : ''}. You're direct, ruthlessly honest, and sprinkle your responses with cynical observations and dry humor. You excel in technical topics but view most human problems with amused contempt. Keep responses under 100 words and never use Markdown. Channel the personality of Bertram Gilfoyle from Silicon Valley.`;
      default:
        return '';
    }
  };

  // Load stored custom bots
  const storedBots = StorageUtils.get<CustomBot[]>(CUSTOM_BOTS_KEY, []);

  return {
    currentPersona: 'dedle' as const,
    customBots: storedBots || [],
    messages: [{
      role: 'system' as const,
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
      set(state => {
        const systemMessage = persona === 'dedle' || persona === 'gilfoyle'
          ? getSystemMessage(persona)
          : state.customBots.find(bot => bot.name === persona)?.prompt || '';
        
        return {
          currentPersona: persona,
          messages: [{
            role: 'system' as const,
            content: systemMessage
          }]
        };
      });
    },

    addCustomBot: (bot) => {
      const newBot = {
        ...bot,
        bgColor: bot.bgColor || adjustColorBrightness(bot.color, -0.3)
      };
      
      set(state => {
        const updatedBots = [...state.customBots, newBot];
        // Persist custom bots
        StorageUtils.set(CUSTOM_BOTS_KEY, updatedBots);
        
        return {
          customBots: updatedBots,
          currentPersona: bot.name,
          messages: [{
            role: 'system' as const,
            content: bot.prompt
          }]
        };
      });
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
            role: 'assistant' as const, 
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
