import { Feather } from "@expo/vector-icons";
import { getCurrentUser } from "@features/auth/api/session";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { useProfileStats } from "@features/profile/hooks/useProfileStats";
import { updateAvatar } from "@features/profile/api";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const AVATAR_SIZE = 96;

export const ProfileScreen = () => {
  const { user, logout, updateUser } = useAuthStore();
  const { enrolledCourses, progressPercent, isHydrated: isStatsHydrated } =
    useProfileStats();
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatarCacheKey, setAvatarCacheKey] = useState(0);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;

  const avatarUri = user?.avatar?.url;

  const loadProfile = useCallback(async () => {
    setIsLoadingProfile(true);
    try {
      const userResponse = await getCurrentUser();
      await updateUser(userResponse.data);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Toast.show({
        type: "error",
        text1: "Could not load profile",
        text2: err.response?.data?.message ?? "Please try again.",
      });
    } finally {
      setIsLoadingProfile(false);
    }
  }, [updateUser]);

  useFocusEffect(
    useCallback(() => {
      void loadProfile();
    }, [loadProfile]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  const handlePickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Toast.show({
        type: "error",
        text1: "Permission Required",
        text2: "Sorry, we need camera roll permissions to make this work!",
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets.length > 0) {
      void handleUploadAvatar(result.assets[0].uri);
    }
  };

  const handleUploadAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      const updatedUser = await updateAvatar(uri);
      await updateUser({
        avatar: updatedUser.avatar,
        username: updatedUser.username,
        email: updatedUser.email,
      });
      setAvatarCacheKey((current) => current + 1);

      Toast.show({
        type: "success",
        text1: "Avatar Updated",
        text2: "Your profile picture has been updated successfully.",
      });
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      Toast.show({
        type: "error",
        text1: "Upload Failed",
        text2:
          err.response?.data?.message ??
          "Something went wrong while uploading.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={[
        styles.container,
        {
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 24,
          paddingHorizontal: isWide ? 48 : 24,
        },
      ]}
      className="bg-background"
    >
      <View
        className={`items-center mb-8 ${isWide ? "max-w-xl self-center w-full" : ""}`}
      >
        <TouchableOpacity
          onPress={() => void handlePickAvatar()}
          disabled={isUploading}
          activeOpacity={0.8}
          className="relative mb-4"
        >
          <View
            className="rounded-full bg-muted items-center justify-center border-2 border-primary overflow-hidden"
            style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
          >
            {avatarUri ? (
              <Image
                key={`${avatarUri}-${avatarCacheKey}`}
                source={{ uri: avatarUri }}
                style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
                contentFit="cover"
                cachePolicy="none"
                transition={200}
              />
            ) : (
              <Text className="text-2xl font-bold text-foreground">
                {user?.username?.charAt(0).toUpperCase()}
              </Text>
            )}
          </View>

          <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-background">
            {isUploading ? (
              <ActivityIndicator size="small" color="#09090b" />
            ) : (
              <Feather name="camera" size={14} color="#09090b" />
            )}
          </View>
        </TouchableOpacity>

        <Text className="text-2xl font-bold text-foreground">
          {user?.username}
        </Text>
        <Text className="text-muted-foreground">{user?.email}</Text>
      </View>

      <Card className={`mb-6 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
        <CardHeader>
          <CardTitle>Learning Stats</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoadingProfile || !isStatsHydrated ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <View className="flex-row justify-between gap-4">
              <View className="flex-1 items-center rounded-lg bg-muted/40 py-4">
                <Text className="text-2xl font-bold text-primary">
                  {enrolledCourses}
                </Text>
                <Text className="text-muted-foreground text-sm text-center mt-1">
                  Enrolled Courses
                </Text>
              </View>
              <View className="flex-1 items-center rounded-lg bg-muted/40 py-4">
                <Text className="text-2xl font-bold text-primary">
                  {progressPercent}%
                </Text>
                <Text className="text-muted-foreground text-sm text-center mt-1">
                  Progress
                </Text>
              </View>
            </View>
          )}
        </CardContent>
      </Card>

      <Card className={`mb-8 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="gap-4">
          <View className="flex-row justify-between border-b border-border pb-2">
            <Text className="text-muted-foreground">User ID</Text>
            <Text className="text-foreground font-medium">
              {user?._id?.substring(0, 8)}...
            </Text>
          </View>
          <View className="flex-row justify-between border-b border-border pb-2">
            <Text className="text-muted-foreground">Role</Text>
            <Text className="text-foreground font-medium">{user?.role}</Text>
          </View>
          <View className="flex-row justify-between">
            <Text className="text-muted-foreground">Verified</Text>
            <Text
              className={user?.isEmailVerified ? "text-green-500" : "text-errorC"}
            >
              {user?.isEmailVerified ? "Yes" : "No"}
            </Text>
          </View>
        </CardContent>
      </Card>

      <Button
        variant="destructive"
        className={`w-full ${isWide ? "max-w-xl self-center" : ""}`}
        onPress={handleLogout}
      >
        <Text>Logout</Text>
      </Button>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
