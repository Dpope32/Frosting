import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';
import ProxyServerManager from '../utils/ProxyServerManager';

interface StoicQuote {
  data: {
    author: string;
    quote: string;
  };
}

// Function to get the appropriate URL based on platform and proxy server status
const getQuoteUrl = async () => {
  const directUrl = 'https://stoic.tekloon.net/stoic-quote';
  
  // Check if we're running on web
  if (Platform.OS === 'web') {
    // Use our proxy server manager to get the appropriate URL
    return ProxyServerManager.getApiUrl('stoic-quote', directUrl);
  }
  
  // For native platforms (iOS, Android), use the direct URL
  return directUrl;
};

export const useStoicQuote = () => {
  const queryClient = useQueryClient();

  return useQuery<StoicQuote>({
    queryKey: ['stoic-quote'],
    queryFn: async () => {
      try {
        const quoteUrl = await getQuoteUrl();
      //  console.log(`[useStoicQuote] Fetching quote from ${quoteUrl}`);
        
        const response = await fetch(quoteUrl);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        return response.json();
      } catch (error) {
        console.error('Error fetching stoic quote:', error);
        throw error;
      }
    },
    staleTime: 4 * 60 * 60 * 1000, // 4 hours in milliseconds
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
};

export const useRefreshStoicQuote = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: ['stoic-quote'] });
};
