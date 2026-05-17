import { CoursesCatalog } from "@features/courses/components/CoursesCatalog";
import { HomeTopBar } from "@features/home/components/HomeTopBar";
import { usePreferencesStore } from "@store/usePreferencesStore";
import { router } from "expo-router";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const HomeScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");

  const preferences = usePreferencesStore((state) => state.preferences);
  const isPreferencesHydrated = usePreferencesStore((state) => state.isHydrated);
  const setLastCoursesSearch = usePreferencesStore(
    (state) => state.setLastCoursesSearch,
  );

  useEffect(() => {
    if (isPreferencesHydrated && preferences.lastCoursesSearch) {
      setSearchQuery(preferences.lastCoursesSearch);
    }
  }, [isPreferencesHydrated, preferences.lastCoursesSearch]);

  const handleSearchChange = useCallback(
    (query: string) => {
      setSearchQuery(query);
      void setLastCoursesSearch(query);
    },
    [setLastCoursesSearch],
  );

  const handleProfilePress = useCallback(() => {
    router.navigate("/(main)/(tabs)/profile");
  }, []);

  const listHeaderTop = useMemo(
    () => (
      <HomeTopBar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onProfilePress={handleProfilePress}
      />
    ),
    [handleProfilePress, handleSearchChange, searchQuery],
  );

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <CoursesCatalog
        searchQuery={searchQuery}
        listHeaderTop={listHeaderTop}
        contentPaddingBottom={insets.bottom + 88}
      />
    </View>
  );
};
