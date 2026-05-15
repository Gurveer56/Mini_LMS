import "../global.css";
import { toastConfig } from "@config/toast";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { registerSessionExpiredHandler } from "@lib/auth/authBridge";
import { OfflineBanner } from "@shared/components/OfflineBanner";
import { hydrateAppState } from "@store/hydrateAppState";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export default function RootLayout() {
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    registerSessionExpiredHandler(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
      });
    });

    void hydrateAppState().finally(() => {
      setIsBootstrapping(false);
    });
  }, []);

  if (isBootstrapping) {
    return (
      <SafeAreaProvider>
        <View className="flex-1 bg-background items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <View className="flex-1 bg-background">
        <OfflineBanner />
        <Stack screenOptions={{ headerShown: false }} />
      </View>
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
