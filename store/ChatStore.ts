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
      content: `You are a concise and friendly AI assistant${username ? ` who addresses the user as ${username}` : ''}. Your responses are brief but helpful, always aiming to answer questions in as few words as possible while maintaining a warm tone. Avoid lengthy explanations unless specifically requested. Do not ever reply in Markdown and try to keep responses to under 100 words.`
    }],
    isLoading: false,
    currentStreamingMessage: '',
    error: null,
    isTyping: false,

    setIsTyping: (typing) => {
      // console.log('Setting typing state:', typing);
      set({ isTyping: typing });
    },

    addMessage: (message) => {
      // console.log('Adding message:', message);
      set((state) => ({
        messages: [...state.messages, message],
      }));
    },

    setIsLoading: (loading) => {
      // console.log('Setting loading state:', loading);
      set({ isLoading: loading });
    },

    setCurrentStreamingMessage: (message) => {
      // console.log('Setting streaming message:', message.slice(-20));
      // Add a small delay to make the typing animation more natural
      setTimeout(() => {
        set({ currentStreamingMessage: message });
      }, 10);
    },

    setError: (error) => {
      // console.log('Setting error:', error);
      set({ error });
    },

    sendMessage: async (content: string): Promise<void> => {
      // console.log('Sending message:', content);
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
        
        // console.log('Creating completion with XMLHttpRequest...');
        let fullResponse = '';
        
        try {
          await new Promise<void>((resolve, reject) => {
            const xhr = new XMLHttpRequest();
            xhr.open('POST', 'https://api.openai.com/v1/chat/completions');
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.setRequestHeader('Authorization', `Bearer ${OPENAI_API_KEY}`);
            xhr.setRequestHeader('Accept', 'text/event-stream');
            xhr.responseType = 'text';

            // Buffer to store partial chunks
            let buffer = '';
            
            xhr.onprogress = (event: ProgressEvent) => {
              try {
                // console.log('Received chunk of size:', event.loaded);
                const newText = xhr.responseText.substr(buffer.length);
                buffer = xhr.responseText;
                
                // console.log('New text received:', newText);
                
                // Process the new text as SSE
                const lines = newText.split('\n');
                for (const line of lines) {
                  if (line.startsWith('data: ') && line !== 'data: [DONE]') {
                    try {
                      const data = JSON.parse(line.slice(6));
                      const content = data.choices[0]?.delta?.content || '';
                      // console.log('Content from chunk:', content);
                      
                      if (content) {
                        fullResponse += content;
                        // console.log('Updated full response:', fullResponse);
                        // Process content character by character for smoother animation
                        const chars = content.split('');
                        chars.forEach((char: string, index: number) => {
                          setTimeout(() => {
                            state.setCurrentStreamingMessage(fullResponse.slice(0, -chars.length + index + 1));
                          }, index * 20); // 20ms delay between each character
                        });
                      }
                    } catch (e) {
                      // console.log('Error parsing line:', line, e);
                    }
                  }
                }
              } catch (error) {
                // console.error('Error processing chunk:', error);
              }
            };

            xhr.onerror = () => {
              // console.error('XHR Error occurred');
              reject(new Error('Network error occurred'));
            };

            xhr.onload = () => {
              if (xhr.status >= 200 && xhr.status < 300) {
                resolve();
              } else {
                reject(new Error(`HTTP error! status: ${xhr.status}`));
              }
            };

            xhr.send(JSON.stringify({
              model: "gpt-4o-mini-2024-07-18",
              messages: apiMessages,
              temperature: 0.7,
              max_tokens: 1000,
              stream: true,
            }));
          });

          if (!fullResponse) {
            throw new Error("Received empty response from OpenAI API");
          }
          

          set(state => ({
            messages: [...state.messages, { 
              role: 'assistant', 
              content: fullResponse 
            }]
          }));
          state.setCurrentStreamingMessage('');
        } catch (streamError: any) {
          // console.error('Stream processing error:', streamError);
          // console.error('Stream error stack:', streamError.stack);
          throw new Error(`Error processing stream: ${streamError.message}`);
        }
      } catch (error: any) {
        // console.error('Error in sendMessage:', error);
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
