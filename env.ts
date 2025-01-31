import Constants from 'expo-constants';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.openaiApiKey;

if (!OPENAI_API_KEY || typeof OPENAI_API_KEY !== 'string') {
  throw new Error('OpenAI API key not found or invalid in app config');
}

export { OPENAI_API_KEY };