import Constants from 'expo-constants';

const apiKey = Constants.expoConfig?.extra?.openAiKey;
if (!apiKey) {
  throw new Error('OpenAI API key not found in app config');
}

export const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
