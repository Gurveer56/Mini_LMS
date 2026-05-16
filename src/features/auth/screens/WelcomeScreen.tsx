import { WelcomeVideoLayer } from "@features/auth/components/WelcomeVideoBackground";
import { Button } from "@shared/components/Button";
import { Text } from "@shared/components/ui/text";
import { router } from "expo-router";
import React from "react";
import { StatusBar, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1 bg-background">
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />
      <WelcomeVideoLayer />

      <View
        className="flex-1 justify-between"
        style={{
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: 24,
        }}
      >
        <View className="flex-1 justify-center">
          <View className="self-start rounded-full border border-white/20 bg-white/10 px-3 py-1 mb-6">
            <Text className="text-foreground/90 text-xs font-semibold tracking-widest uppercase">
              Mini LMS
            </Text>
          </View>
          <Text className="text-4xl font-bold text-foreground leading-tight">
            Learn without{"\n"}limits.
          </Text>
          <Text className="text-base text-foreground/75 mt-4 leading-6 max-w-[90%]">
            Discover courses, track progress, and pick up where you left off —
            built for a smooth mobile experience.
          </Text>
        </View>

        <View className="gap-3">
          <Button
            variant="default"
            size="lg"
            onPress={() => router.push("/(auth)/login")}
            className="w-full rounded-2xl"
          >
            Log in
          </Button>
          <Button
            variant="outline"
            size="lg"
            onPress={() => router.push("/(auth)/register")}
            className="w-full rounded-2xl border-white/30"
          >
            Create account
          </Button>
          <Text className="text-center text-foreground/50 text-xs mt-2">
            Video plays while this screen is visible
          </Text>
        </View>
      </View>
    </View>
  );
};
