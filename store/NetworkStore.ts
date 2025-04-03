import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

interface NetworkState {
  details: NetInfoState | null;
  isLoading: boolean;
  error: string | null;
  fetchNetworkInfo: () => Promise<void>;
  startNetworkListener: () => () => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
  details: null,
  isLoading: false,
  error: null,
  fetchNetworkInfo: async () => {
    console.log('Fetching network info...');
    set({ isLoading: true, error: null });
    try {
      const state = await NetInfo.fetch();
      console.log('Received network state:', state);
      set({
        details: state,
        isLoading: false
      });
    } catch (err) {
      console.error('Error fetching network info:', err);
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch network info',
        isLoading: false 
      });
    }
  },
  startNetworkListener: () => {
    console.log('Starting network listener');
    // Return unsubscribe function for cleanup
    return NetInfo.addEventListener(state => {
      console.log('Network state changed:', state);
      set({ details: state });
    });
  }
}));
