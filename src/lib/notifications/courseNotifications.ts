import * as Notifications from "expo-notifications";

export const ensureNotificationPermission = async (): Promise<boolean> => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  if (existingStatus === "granted") {
    return true;
  }

  const { status } = await Notifications.requestPermissionsAsync();
  return status === "granted";
};

export const showFiveEnrollmentsNotification = async (): Promise<void> => {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "5 courses enrolled",
      body: "You now have 5 active course enrollments.",
    },
    trigger: null,
  });
};

export const showDevTestNotification = async (): Promise<boolean> => {
  const hasPermission = await ensureNotificationPermission();
  if (!hasPermission) {
    return false;
  }

  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Dev notification",
      body: "Notifications are working from developer tools.",
    },
    trigger: null,
  });

  return true;
};
