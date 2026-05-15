import { useNetworkStore } from "@store/useNetworkStore";
import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const OfflineBanner = memo(function OfflineBanner() {
  const insets = useSafeAreaInsets();
  const isOffline = useNetworkStore((state) => state.isOffline);

  if (!isOffline) {
    return null;
  }

  return (
    <View
      className="bg-destructive px-4 py-2.5 flex-row items-center justify-center gap-2"
      style={{ paddingTop: insets.top > 0 ? insets.top : 8 }}
    >
      <Feather name="wifi-off" size={16} color="#fafafa" />
      <Text className="text-white text-sm font-medium">
        You are offline. Some features may be unavailable.
      </Text>
    </View>
  );
});
