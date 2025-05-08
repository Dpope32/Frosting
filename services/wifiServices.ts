import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
  NetInfoStateType,
  NetInfoWifiState,
  NetInfoCellularState,
} from '@react-native-community/netinfo';

let unsubscribe: NetInfoSubscription | null = null;

const logIfDefined = (label: string, value: unknown) => {
  if (value !== undefined && value !== null) {
    console.log(`${label}:`, value);
  }
};

const logNetInfoState = (state: NetInfoState) => {

  switch (state.type) {
    case NetInfoStateType.wifi: {
      const wifi = state as NetInfoWifiState;
      console.group('[📡 WiFi]');
      logIfDefined('SSID', wifi.details.ssid);
      logIfDefined('BSSID', wifi.details.bssid);
      logIfDefined('IP Address', wifi.details.ipAddress);
      logIfDefined('Subnet', wifi.details.subnet);
      logIfDefined('Strength', wifi.details.strength);
      logIfDefined('Frequency', wifi.details.frequency);
      logIfDefined('Link Speed', wifi.details.linkSpeed);
      logIfDefined('Expensive', wifi.details.isConnectionExpensive);
      console.groupEnd();
      break;
    }
    case NetInfoStateType.cellular: {
      const cell = state as NetInfoCellularState;
      console.group('[📱 Cellular]');
      logIfDefined('Carrier', cell.details.carrier);
      logIfDefined('Generation', cell.details.cellularGeneration);
      logIfDefined('Expensive', cell.details.isConnectionExpensive);
      console.groupEnd();
      break;
    }
    default:
      if (state.details) {
        console.group('[📦 Other Details]');
        console.groupEnd();
      }
      break;
  }

  console.groupEnd();
};

const fetchCurrentState = async () => {
  console.log('[🔍 Fetching NetInfo state]');
  const state = await NetInfo.fetch();
  logNetInfoState(state);
  return state;
};

const refreshState = async () => {
  const state = await NetInfo.refresh();
  logNetInfoState(state);
  return state;
};

const startListening = () => {
  if (unsubscribe) unsubscribe();
  unsubscribe = NetInfo.addEventListener(logNetInfoState);
};

const stopListening = () => {
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }
};

const getWifiDetails = (state: NetInfoState | null) => {
  if (!state) return null;

  if (state.type === NetInfoStateType.wifi && state.details) {
    const wifi = state as NetInfoWifiState;
    return wifi.details;
  }

  return null;
};

const wifiServices = {
  getWifiDetails,
  fetchCurrentState,
  refreshState,
  startListening,
  stopListening,
};

export default wifiServices;
export {
  getWifiDetails,
  fetchCurrentState,
  refreshState,
  startListening,
  stopListening,
};