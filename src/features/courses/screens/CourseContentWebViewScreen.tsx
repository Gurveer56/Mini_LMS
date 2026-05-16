import { Feather } from "@expo/vector-icons";
import { useAuthStore } from "@features/auth/store/useAuthStore";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import {
  isAllowedWebViewNavigation,
  parseWebToNativeMessage,
} from "@features/courses/webview/bridge";
import { useCourseWebViewSource } from "@features/courses/webview/useCourseWebViewSource";
import { toCourseWebPayload } from "@features/courses/webview/types";
import { Button } from "@shared/components/ui/button";
import { Text } from "@shared/components/ui/text";
import { router, useLocalSearchParams } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";
import WebView, { type WebViewMessageEvent } from "react-native-webview";

export const CourseContentWebViewScreen = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const courseId = Number(id);
  const insets = useSafeAreaInsets();
  const webViewRef = useRef<WebView>(null);

  const course = useCoursesStore((state) => state.getCourseById(courseId));
  const userId = useAuthStore((state) => state.user?._id);
  const coursePayload = course ? toCourseWebPayload(course) : null;

  const {
    source,
    injectedJavaScriptBeforeContentLoaded,
    isLoading: isSourceLoading,
    loadWarning,
  } = useCourseWebViewSource(coursePayload, userId);

  const [isWebReady, setIsWebReady] = useState(false);
  const [webViewError, setWebViewError] = useState<string | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const handleRetry = useCallback(() => {
    setWebViewError(null);
    setIsWebReady(false);
    setRetryKey((current) => current + 1);
  }, []);

  const handleWebMessage = useCallback(
    (event: WebViewMessageEvent) => {
      const message = parseWebToNativeMessage(event.nativeEvent.data);
      if (!message) {
        return;
      }

      switch (message.type) {
        case "WEBVIEW_READY":
          setIsWebReady(true);
          break;
        case "LESSON_COMPLETE": {
          const payloadCourseId = message.payload?.courseId;
          if (
            typeof payloadCourseId === "number" &&
            payloadCourseId === courseId
          ) {
            Toast.show({
              type: "success",
              text1: "Lesson complete",
              text2: "Progress saved on device (demo).",
            });
          }
          break;
        }
        case "REQUEST_GO_BACK":
          router.back();
          break;
        default:
          break;
      }
    },
    [courseId],
  );

  if (!course) {
    return (
      <View
        className="flex-1 bg-background items-center justify-center px-6"
        style={{ paddingTop: insets.top }}
      >
        <Text className="text-foreground text-lg font-semibold text-center">
          Course not found
        </Text>
        <Button className="mt-4" onPress={() => router.back()}>
          <Text>Go back</Text>
        </Button>
      </View>
    );
  }

  const showLoader = isSourceLoading || (!webViewError && !isWebReady);

  return (
    <View className="flex-1 bg-background">
      <View
        className="flex-row items-center justify-between px-4 border-b border-border"
        style={{ paddingTop: insets.top + 8, paddingBottom: 12 }}
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-muted items-center justify-center"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color="#fafafa" />
        </Pressable>
        <Text className="text-foreground font-semibold flex-1 text-center mx-2" numberOfLines={1}>
          Course content
        </Text>
        <View className="w-10" />
      </View>

      {loadWarning ? (
        <View className="px-4 py-2 bg-muted/30">
          <Text className="text-muted-foreground text-xs text-center">
            {loadWarning}
          </Text>
        </View>
      ) : null}

      {webViewError ? (
        <View className="flex-1 items-center justify-center px-6 gap-4">
          <Feather name="alert-circle" size={40} color="#f87171" />
          <Text className="text-foreground text-center font-semibold">
            Could not load course content
          </Text>
          <Text className="text-muted-foreground text-center text-sm">
            {webViewError}
          </Text>
          <Button onPress={handleRetry}>
            <Text>Try again</Text>
          </Button>
        </View>
      ) : source ? (
        <View className="flex-1">
          <WebView
            key={`${courseId}-${retryKey}`}
            ref={webViewRef}
            source={source}
            style={{ flex: 1, backgroundColor: "#09090b" }}
            originWhitelist={[
              "file://",
              "https://app.local",
              "about:blank",
            ]}
            injectedJavaScriptBeforeContentLoaded={
              injectedJavaScriptBeforeContentLoaded
            }
            onMessage={handleWebMessage}
            onLoadEnd={() => setWebViewError(null)}
            onError={() =>
              setWebViewError(
                "The WebView failed to render the course page.",
              )
            }
            onHttpError={() =>
              setWebViewError("Received an HTTP error while loading content.")
            }
            onShouldStartLoadWithRequest={(request) =>
              isAllowedWebViewNavigation(request.url)
            }
            javaScriptEnabled
            domStorageEnabled={false}
            sharedCookiesEnabled={false}
            thirdPartyCookiesEnabled={false}
            setSupportMultipleWindows={false}
            allowsBackForwardNavigationGestures={false}
            allowFileAccess={false}
            allowUniversalAccessFromFileURLs={false}
            startInLoadingState
            renderLoading={() => (
              <View className="flex-1 items-center justify-center bg-background">
                <ActivityIndicator size="large" color="#ffffff" />
              </View>
            )}
          />

          {showLoader ? (
            <View
              className="absolute inset-0 items-center justify-center bg-background/80"
              pointerEvents="none"
            >
              <ActivityIndicator size="large" color="#ffffff" />
              <Text className="text-muted-foreground mt-3 text-sm">
                Loading lesson…
              </Text>
            </View>
          ) : null}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#ffffff" />
        </View>
      )}

      <View
        className="px-4 pt-2 border-t border-border"
        style={{ paddingBottom: insets.bottom + 8 }}
      >
        <Text className="text-muted-foreground text-xs text-center">
          Secure bridge · headers + validated postMessage · no tokens in web
        </Text>
      </View>
    </View>
  );
};
