import { useAuthStore } from "@features/auth/store/useAuthStore";
import { Redirect, Stack } from "expo-router";
import { ActivityIndicator, View } from "react-native";

export default function MainLayout() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/welcome" />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="course/[id]"
        options={{ animation: "slide_from_right" }}
      />
      <Stack.Screen
        name="course/[id]/content"
        options={{ animation: "slide_from_right" }}
      />
    </Stack>
  );
}
