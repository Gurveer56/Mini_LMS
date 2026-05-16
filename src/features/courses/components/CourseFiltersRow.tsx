import { triggerDummyCourseApiError } from "@lib/api/debugErrors";
import { Button } from "@shared/components/ui/button";
import { Text } from "@shared/components/ui/text";
import React, { memo, useCallback } from "react";
import { View } from "react-native";
import Toast from "react-native-toast-message";

interface CourseFiltersRowProps {
  showBookmarksOnly: boolean;
  showSimulateError: boolean;
  onToggleBookmarksOnly: () => void;
  onSimulateError: () => void;
}

export const CourseFiltersRow = memo(function CourseFiltersRow({
  showBookmarksOnly,
  showSimulateError,
  onToggleBookmarksOnly,
  onSimulateError,
}: CourseFiltersRowProps) {
  const handleSimulateError = useCallback(() => {
    triggerDummyCourseApiError();
    Toast.show({
      type: "info",
      text1: "Dummy error armed",
      text2: "Pull to refresh to test the error flow.",
    });
    onSimulateError();
  }, [onSimulateError]);

  return (
    <View className="flex-row flex-wrap items-center gap-2 pb-4">
      <Button
        variant={showBookmarksOnly ? "default" : "secondary"}
        size="sm"
        onPress={onToggleBookmarksOnly}
      >
        <Text className="text-xs">
          {showBookmarksOnly ? "Saved only" : "All courses"}
        </Text>
      </Button>
      {showSimulateError ? (
        <Button variant="outline" size="sm" onPress={handleSimulateError}>
          <Text className="text-xs">Test API error</Text>
        </Button>
      ) : null}
    </View>
  );
});
