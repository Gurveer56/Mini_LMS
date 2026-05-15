import { triggerDummyCourseApiError } from "@lib/api/debugErrors";
import { Button } from "@shared/components/ui/button";
import { Input } from "@shared/components/ui/input";
import { Text } from "@shared/components/ui/text";
import React, { memo, useCallback } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

interface CourseSearchHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  resultCount: number;
  showBookmarksOnly: boolean;
  onToggleBookmarksOnly: () => void;
  onSimulateError: () => void;
}

export const CourseSearchHeader = memo(function CourseSearchHeader({
  searchQuery,
  onSearchChange,
  resultCount,
  showBookmarksOnly,
  onToggleBookmarksOnly,
  onSimulateError,
}: CourseSearchHeaderProps) {
  const handleSimulateError = useCallback(() => {
    triggerDummyCourseApiError();
    Toast.show({
      type: "info",
      text1: "Dummy error armed",
      text2: "Pull to refresh or tap Retry to see the failure flow.",
    });
    onSimulateError();
  }, [onSimulateError]);

  return (
    <View className="pb-4 gap-3">
      <View>
        <Text className="text-3xl font-bold text-foreground">Courses</Text>
        <Text className="text-muted-foreground mt-1">
          Browse instructors and enroll in courses
        </Text>
      </View>
      <Input
        placeholder="Search courses, instructors, categories..."
        value={searchQuery}
        onChangeText={onSearchChange}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        clearButtonMode="while-editing"
      />
      <View className="flex-row flex-wrap items-center gap-2">
        
        <Button
          variant={showBookmarksOnly ? "default" : "secondary"}
          size="sm"
          onPress={onToggleBookmarksOnly}
        >
          <Text className="text-xs">
            {showBookmarksOnly ? "Bookmarks on" : "Bookmarks"}
          </Text>
        </Button>
        <Button variant="outline" size="sm" onPress={handleSimulateError}>
          <Text className="text-xs">Test API Error</Text>
        </Button>
      </View>
    </View>
  );
});
