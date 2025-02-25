import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Platform } from 'react-native';

interface StoicQuote {
  data: {
    author: string;
    quote: string;
  };
}

// Function to get the appropriate URL based on platform
const getQuoteUrl = () => {
  // Check if we're running on web
  if (Platform.OS === 'web') {
    // Use our local proxy server for web environment
    return 'http://localhost:3000/api/stoic-quote';
  }
  
  // For native platforms (iOS, Android), use the direct URL
  return 'https://stoic.tekloon.net/stoic-quote';
};

export const useStoicQuote = () => {
  const queryClient = useQueryClient();

  return useQuery<StoicQuote>({
    queryKey: ['stoic-quote'],
    queryFn: async () => {
      try {
        const quoteUrl = getQuoteUrl();
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
