import { create } from 'zustand';
import NetInfo, { NetInfoState, NetInfoWifiState } from '@react-native-community/netinfo';

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
    set({ isLoading: true, error: null });
    try {
      const state = await NetInfo.fetch();
      set({
        details: state,
        isLoading: false
      });
    } catch (err) {
      set({ 
        error: err instanceof Error ? err.message : 'Failed to fetch network info',
        isLoading: false 
      });
    }
  },
  startNetworkListener: () => {
    // Return unsubscribe function for cleanup
    return NetInfo.addEventListener(state => {
      set({ details: state });
    });
  }
}));

// Helper function to get WiFi details safely
export const getWifiDetails = (state: NetInfoState | null): NetInfoWifiState['details'] | null => {
  if (state?.type === 'wifi' && state.details) {
    return state.details;
  }
  return null;
};
