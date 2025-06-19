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
        
        const response = await fetch(quoteUrl);
        
        if (!response.ok) {
          // Handle non-2xx responses
          throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
        }

        // Check content type before parsing JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          // Handle cases where the response is 200 OK but not JSON (e.g., proxy returning HTML)
          const responseText = await response.text(); // Get the text content for logging
          console.error('Received non-JSON response from quote API:', responseText);
          throw new Error(`Expected JSON response, but received content type: ${contentType}`);
        }

        // Parse the JSON response
        const rawData = await response.json();
        
        // Transform the response to match expected format
        // Handle both response formats: { text: "...", author: "..." } and { data: { quote: "...", author: "..." } }
        if (rawData.data) {
          // Already in expected format
          return rawData;
        } else if (rawData.text && rawData.author) {
          // Transform tekloon.net format to expected format
          return {
            data: {
              quote: rawData.text,
              author: rawData.author
            }
          };
        } else if (rawData.quote && rawData.author) {
          // Transform stoic-quotes.com format to expected format
          return {
            data: {
              quote: rawData.quote,
              author: rawData.author
            }
          };
        } else {
          throw new Error('Unexpected quote API response format');
        }

      } catch (error) {
        // Log the specific error and re-throw for React Query
        console.error('Error fetching or parsing stoic quote:', error);
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
