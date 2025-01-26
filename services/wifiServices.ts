import { NetInfoWifiState, NetInfoState } from "@react-native-community/netinfo";

const getWifiDetails = (state: NetInfoState | null): NetInfoWifiState['details'] | null => {
  if (state?.type === 'wifi' && state.details) {
    return state.details;
  }
  return null;
};

const wifiServices = {
  getWifiDetails,
};

export default wifiServices;
export { getWifiDetails };
