import NetInfo, { NetInfoState } from "@react-native-community/netinfo";
import { create } from "zustand";

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  isOffline: boolean;
  hydrate: () => () => void;
}

const mapNetInfo = (state: NetInfoState) => {
  const isConnected = state.isConnected ?? true;
  const isInternetReachable = state.isInternetReachable;
  const isOffline =
    !isConnected || isInternetReachable === false;

  return { isConnected, isInternetReachable, isOffline };
};

export const useNetworkStore = create<NetworkState>((set) => ({
  isConnected: true,
  isInternetReachable: true,
  isOffline: false,

  hydrate: () => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      set(mapNetInfo(state));
    });

    void NetInfo.fetch().then((state) => {
      set(mapNetInfo(state));
    });

    return unsubscribe;
  },
}));
