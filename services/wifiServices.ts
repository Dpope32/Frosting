import NetInfo, {
  NetInfoState,
  NetInfoSubscription,
  NetInfoStateType,
  NetInfoWifiState,
  NetInfoCellularState,
} from '@react-native-community/netinfo';

let unsubscribe: NetInfoSubscription | null = null;

const logNetInfoState = (state: NetInfoState) => {
  switch (state.type) {
    case NetInfoStateType.wifi: {
      console.group('[📡 WiFi]');
      console.groupEnd();
      break;
    }
    case NetInfoStateType.cellular: {
      console.group('[📱 Cellular]');
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