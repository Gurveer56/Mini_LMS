import { getCurrentUser } from "@features/auth/api/session";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import {
  AccountDetailsCard,
  DeveloperToolsCard,
  EnrolledCoursesSection,
  ProfileHeader,
  ProfileLogoutButton,
  ProfileStatsCard,
} from "@features/profile/components";
import { useProfileStats } from "@features/profile/hooks/useProfileStats";
import { testAccessTokenRefresh } from "@lib/auth/testTokenRefresh";
import { showDevTestNotification } from "@lib/notifications/courseNotifications";
import { useEnrollmentStore } from "@features/courses/store/useEnrollmentStore";
import { usePreferencesStore } from "@store/usePreferencesStore";
import * as ImagePicker from "expo-image-picker";
import { router, useFocusEffect } from "expo-router";
import React, { useCallback, useState } from "react";
import { ScrollView, StyleSheet, useWindowDimensions } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

export const ProfileScreen = () => {
  const { user, logout, updateUser, localAvatar, setLocalAvatar } =
    useAuthStore();
  const { enrolledCourses, progressPercent, isHydrated: isStatsHydrated } =
    useProfileStats();
  const enrolledIds = useEnrollmentStore((state) => state.enrolledIds);
  const enrolledIdsArray = React.useMemo(() => Array.from(enrolledIds), [enrolledIds]);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [avatarCacheKey, setAvatarCacheKey] = useState(0);
  const [isTestingRefresh, setIsTestingRefresh] = useState(false);
  const [isDeveloperToolsExpanded, setIsDeveloperToolsExpanded] =
    useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isWide = width >= 768;
  const preferences = usePreferencesStore((state) => state.preferences);
  const setShowHomeApiErrorTester = usePreferencesStore(
    (state) => state.setShowHomeApiErrorTester,
  );
  const setDisableEnrollmentActions = usePreferencesStore(
    (state) => state.setDisableEnrollmentActions,
  );

  const avatarUri = localAvatar || user?.avatar?.url;

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
      if (isTestingRefresh) {
        return;
      }
      void loadProfile();
    }, [isTestingRefresh, loadProfile]),
  );

  const handleLogout = async () => {
    await logout();
    router.replace("/(auth)/welcome");
  };

  const handleTestTokenRefresh = async () => {
    setIsTestingRefresh(true);
    try {
      const result = await testAccessTokenRefresh();
      Toast.show({
        type: result.ok ? "success" : "error",
        text1: result.ok ? "Token refresh works" : "Token refresh failed",
        text2: result.message,
      });
    } finally {
      setIsTestingRefresh(false);
    }
  };

  const handleShowNotification = async () => {
    const shown = await showDevTestNotification();
    if (!shown) {
      Toast.show({
        type: "error",
        text1: "Notification blocked",
        text2: "Notification permission was not granted.",
      });
    }
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
      const asset = result.assets[0];
      void handleSaveAvatar(asset.uri);
    }
  };

  const handleSaveAvatar = async (uri: string) => {
    setIsUploading(true);
    try {
      await setLocalAvatar(uri);
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
        text1: "Avatar Update Failed",
        text2: err.response?.data?.message ?? "Could not save the avatar.",
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
      <ProfileHeader
        user={user}
        avatarCacheKey={avatarCacheKey}
        avatarUri={avatarUri}
        isWide={isWide}
        isSavingAvatar={isUploading}
        onPickAvatar={() => void handlePickAvatar()}
      />

      <ProfileStatsCard
        enrolledCourses={enrolledCourses}
        progressPercent={progressPercent}
        isLoading={isLoadingProfile || !isStatsHydrated}
        isWide={isWide}
      />

      <EnrolledCoursesSection 
        enrolledIds={enrolledIdsArray}
        isWide={isWide}
      />

      <DeveloperToolsCard
        isExpanded={isDeveloperToolsExpanded}
        isTestingRefresh={isTestingRefresh}
        isWide={isWide}
        showHomeApiErrorTester={preferences.showHomeApiErrorTester}
        disableEnrollmentActions={preferences.disableEnrollmentActions}
        onToggleExpanded={() =>
          setIsDeveloperToolsExpanded((current) => !current)
        }
        onToggleHomeApiErrorTester={(value) =>
          void setShowHomeApiErrorTester(value)
        }
        onToggleDisableEnrollmentActions={(value) =>
          void setDisableEnrollmentActions(value)
        }
        onTestTokenRefresh={() => void handleTestTokenRefresh()}
        onShowNotification={() => void handleShowNotification()}
      />

      <AccountDetailsCard user={user} isWide={isWide} />

      <ProfileLogoutButton isWide={isWide} onLogout={handleLogout} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
  },
});
