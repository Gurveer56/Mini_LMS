import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { ActivityIndicator, Text, View } from "react-native";

interface ProfileStatsCardProps {
  enrolledCourses: number;
  progressPercent: number;
  isLoading: boolean;
  isWide: boolean;
}

export const ProfileStatsCard = ({
  enrolledCourses,
  progressPercent,
  isLoading,
  isWide,
}: ProfileStatsCardProps) => {
  return (
    <Card className={`mb-6 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
      <CardHeader>
        <CardTitle>Learning Stats</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
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
  );
};
