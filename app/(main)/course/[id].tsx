import { CourseDetailScreen } from "@features/courses/screens/CourseDetailScreen";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function CourseDetailRoute() {
  const insets = useSafeAreaInsets();

  return (
    <View className="flex-1">
      <View
        className="absolute z-10 left-0 right-0"
        style={{ top: insets.top + 8, paddingHorizontal: 16 }}
        pointerEvents="box-none"
      >
        <Pressable
          onPress={() => router.back()}
          className="w-10 h-10 rounded-full bg-background/80 items-center justify-center border border-border"
          accessibilityRole="button"
          accessibilityLabel="Go back"
        >
          <Feather name="arrow-left" size={20} color="#fafafa" />
        </Pressable>
      </View>
      <CourseDetailScreen />
    </View>
  );
}
