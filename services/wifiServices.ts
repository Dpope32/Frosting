import { NetInfoState } from "@react-native-community/netinfo";

// Simple, correct implementation
const getWifiDetails = (state: NetInfoState | null) => {
  if (!state) return null;
  
  // Check if it's a wifi connection and has details
  if (state.type === 'wifi' && state.details) {
    return state.details;
  }
  
  return null;
};

const wifiServices = {
  getWifiDetails,
};

export default wifiServices;
export { getWifiDetails };