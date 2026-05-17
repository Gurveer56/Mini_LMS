import { WelcomeVideoLayer } from "@features/auth/components/WelcomeVideoBackground";
import { Button } from "@shared/components/Button";
import { Text } from "@shared/components/ui/text";
import { Image } from "expo-image";
import { router } from "expo-router";
import React from "react";
import { StatusBar, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const WelcomeScreen = () => {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const logoWidth = Math.min(60, width * 3);

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
          <View className="flex-row items-center mb-6 gap-1">

          <Image
            source={require("../../../../assets/images/android-icon-foreground.png")}
            style={{
              width: logoWidth,
              height: logoWidth / .8,
            }}
            contentFit="cover"
            />
            <View>

            <Text className="text-xl font-bold">Mini LMS </Text>
            <Text className="text-xs font-light">mobile learning platform</Text>
            </View>
            </View>
          <Text className="text-4xl font-bold text-foreground leading-tight">
            Learn without{"\n"}limits.
          </Text>
          <Text className="text-base text-foreground/75 mt-4 leading-6 max-w-[90%]">
            Discover courses, track progress, and pick up where you left off -
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
        </View>
      </View>
    </View>
  );
};
