import { useQuery, useQueryClient } from '@tanstack/react-query';

interface StoicQuote {
  data: {
    author: string;
    quote: string;
  };
}

export const useStoicQuote = () => {
  const queryClient = useQueryClient();

  return useQuery<StoicQuote>({
    queryKey: ['stoic-quote'],
    queryFn: async () => {
      const response = await fetch('https://stoic.tekloon.net/stoic-quote');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
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
