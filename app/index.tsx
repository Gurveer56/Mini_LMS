import { Redirect } from "expo-router";
import { ActivityIndicator, View } from "react-native";
import { useAuthStore } from "@features/auth/store/useAuthStore";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View className="flex-1 bg-background items-center justify-center">
        <ActivityIndicator size="large" color="#ffffff" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/(tabs)/home" />;
  }

  return <Redirect href="/(auth)/welcome" />;
}
