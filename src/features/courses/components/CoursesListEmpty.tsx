import { Text } from "@shared/components/ui/text";
import React, { memo } from "react";
import { View } from "react-native";

interface CoursesListEmptyProps {
  isLoading: boolean;
  hasSearchQuery: boolean;
}

export const CoursesListEmpty = memo(function CoursesListEmpty({
  isLoading,
  hasSearchQuery,
}: CoursesListEmptyProps) {
  if (isLoading) {
    return null;
  }

  return (
    <View className="py-16 items-center px-6">
      <Text className="text-foreground font-semibold text-lg text-center">
        {hasSearchQuery ? "No courses match your search" : "No courses available"}
      </Text>
      <Text className="text-muted-foreground text-center mt-2">
        {hasSearchQuery
          ? "Try a different keyword or clear the search field."
          : "Pull down to refresh the catalog."}
      </Text>
    </View>
  );
});
