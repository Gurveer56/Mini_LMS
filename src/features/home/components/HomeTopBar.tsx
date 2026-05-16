import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { Input } from "@shared/components/ui/input";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import React, { memo } from "react";
import { Pressable, View } from "react-native";

interface HomeTopBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onProfilePress: () => void;
  resultCount: number;
}

export const HomeTopBar = memo(function HomeTopBar({
  searchQuery,
  onSearchChange,
  onProfilePress,
  resultCount,
}: HomeTopBarProps) {
  const { user, localAvatar } = useAuthStore();
  const avatarUri = localAvatar || user?.avatar?.url;
  const initial = user?.username?.charAt(0).toUpperCase() ?? "?";

  return (
    <View className="px-5 pb-4 gap-4">
      <View className="flex-row items-center justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-muted-foreground text-sm">Welcome back</Text>
          <Text className="text-2xl font-bold text-foreground" numberOfLines={1}>
            {user?.username ?? "Learner"}
          </Text>
        </View>
        <Pressable
          onPress={onProfilePress}
          className="w-12 h-12 rounded-full border-2 border-primary/30 overflow-hidden bg-muted items-center justify-center active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Open profile"
        >
          {avatarUri ? (
            <Image
              source={{ uri: avatarUri }}
              style={{ width: 48, height: 48 }}
              contentFit="cover"
            />
          ) : (
            <Text className="text-foreground font-bold text-lg">{initial}</Text>
          )}
        </Pressable>
      </View>

      <View className="flex-row items-center gap-2">
        <View className="flex-1 relative">
          <View className="absolute left-3 top-0 bottom-0 justify-center z-10">
            <Feather name="search" size={18} color="#71717a" />
          </View>
          <Input
            placeholder="Search courses, topics, instructors..."
            value={searchQuery}
            onChangeText={onSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            className="pl-10 bg-inputBackground border-border"
          />
        </View>
        <Pressable
          onPress={onProfilePress}
          className="w-11 h-11 rounded-xl bg-muted items-center justify-center border border-border active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel="Go to profile tab"
        >
          <Feather name="user" size={20} color="#fafafa" />
        </Pressable>
      </View>

      <Text className="text-muted-foreground text-xs">
        {resultCount} course{resultCount === 1 ? "" : "s"} available
      </Text>
    </View>
  );
});
