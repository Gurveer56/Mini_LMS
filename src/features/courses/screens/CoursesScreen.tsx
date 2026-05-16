import { CoursesCatalog } from "@features/courses/components/CoursesCatalog";
import { usePreferencesStore } from "@store/usePreferencesStore";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export const CoursesScreen = () => {
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState("");
  const preferences = usePreferencesStore((state) => state.preferences);
  const isPreferencesHydrated = usePreferencesStore((state) => state.isHydrated);

  useEffect(() => {
    if (isPreferencesHydrated && preferences.lastCoursesSearch) {
      setSearchQuery(preferences.lastCoursesSearch);
    }
  }, [isPreferencesHydrated, preferences.lastCoursesSearch]);

  return (
    <View
      className="flex-1 bg-background"
      style={{ paddingTop: insets.top }}
    >
      <CoursesCatalog
        searchQuery={searchQuery}
        contentPaddingBottom={insets.bottom + 88}
      />
    </View>
  );
};
