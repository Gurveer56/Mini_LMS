import "../global.css";
import { Stack } from "expo-router";
import Toast from 'react-native-toast-message';
import { toastConfig } from '@config/toast';
import { useEffect } from 'react';
import { useAuthStore } from '@features/auth/store/useAuthStore';

export default function RootLayout() {
  const checkAuth = useAuthStore((state) => state.checkAuth);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <>
      <Stack screenOptions={{ headerShown: false }} />
      <Toast config={toastConfig} />
    </>
  );
}
