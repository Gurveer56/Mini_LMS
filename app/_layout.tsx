import { toastConfig } from "@config/toast";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { registerSessionExpiredHandler } from "@lib/auth/authBridge";
import { OfflineBanner } from "@shared/components/OfflineBanner";
import { hydrateAppState } from "@store/hydrateAppState";
import * as Notifications from "expo-notifications";
import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, AppState, Platform, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import "../global.css";

Notifications.setNotificationHandler({
  handleNotification: async (notification) => {
    const isReminder = notification.request.content.title === "We miss you!";
    
    return {
      shouldPlaySound: !isReminder,
      shouldSetBadge: false,
      shouldShowBanner: !isReminder,
      shouldShowList: !isReminder,
    };
  },
});

if (Platform.OS === 'android') {
  Notifications.setNotificationChannelAsync('default', {
    name: 'default',
    importance: Notifications.AndroidImportance.MAX,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#208AEF',
  });
}

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

    const scheduleReminder = async () => {

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== "granted") {
        console.log("Notification permission not granted");
        return;
      }

      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: "We miss you!",
          body: "It's been 24 hours since your last visit. Come check out new courses!",
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: 24 * 60 * 60,
          repeats: false,
        },
      });
      console.log("Notification scheduled for 24 hours from now");
    };

    const subscription = AppState.addEventListener("change", (nextAppState) => {
      if (nextAppState === "active") {
        void Notifications.cancelAllScheduledNotificationsAsync();
        console.log("User is active, cancelling reminders");
      } else if (nextAppState === "background") {
        void scheduleReminder();
        console.log("User went to background, scheduling reminder");
      }
    });

    return () => {
      subscription.remove();
    };
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
