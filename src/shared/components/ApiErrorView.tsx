import { ApiErrorState } from "@lib/api/errors";
import { Button } from "@shared/components/ui/button";
import { Text } from "@shared/components/ui/text";
import { Feather } from "@expo/vector-icons";
import React, { memo } from "react";
import { ActivityIndicator, View } from "react-native";

interface ApiErrorViewProps {
  error: ApiErrorState;
  isRetrying?: boolean;
  onRetry?: () => void;
  compact?: boolean;
}

export const ApiErrorView = memo(function ApiErrorView({
  error,
  isRetrying = false,
  onRetry,
  compact = false,
}: ApiErrorViewProps) {
  const iconName =
    error.code === "NETWORK" || error.code === "TIMEOUT"
      ? "wifi-off"
      : error.code === "SIMULATED"
        ? "alert-triangle"
        : "alert-circle";

  return (
    <View
      className={`items-center justify-center ${
        compact ? "py-4 px-4" : "py-12 px-6"
      }`}
    >
      <View className="w-14 h-14 rounded-full bg-destructive/20 items-center justify-center mb-4">
        <Feather name={iconName} size={28} color="#ef4444" />
      </View>
      <Text className="text-foreground font-semibold text-lg text-center mb-2">
        {error.code === "TIMEOUT" ? "Request timed out" : "Could not load data"}
      </Text>
      <Text className="text-muted-foreground text-center leading-5 mb-6">
        {error.message}
      </Text>
      {error.canRetry && onRetry ? (
        <Button
          variant="default"
          onPress={onRetry}
          disabled={isRetrying}
          className="min-w-[140px]"
        >
          {isRetrying ? (
            <View className="flex-row items-center gap-2">
              <ActivityIndicator size="small" color="#09090b" />
              <Text>Retrying...</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2">
              <Feather name="refresh-cw" size={16} color="#09090b" />
              <Text>Retry</Text>
            </View>
          )}
        </Button>
      ) : null}
    </View>
  );
});
