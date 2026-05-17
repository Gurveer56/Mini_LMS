import { Feather } from "@expo/vector-icons";
import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { ActivityIndicator, Switch, Text, View } from "react-native";

interface DeveloperToolsCardProps {
  isExpanded: boolean;
  isTestingRefresh: boolean;
  isWide: boolean;
  showHomeApiErrorTester: boolean;
  disableEnrollmentActions: boolean;
  onToggleExpanded: () => void;
  onToggleHomeApiErrorTester: (value: boolean) => void;
  onToggleDisableEnrollmentActions: (value: boolean) => void;
  onTestTokenRefresh: () => void;
  onShowNotification: () => void;
}

export const DeveloperToolsCard = ({
  isExpanded,
  isTestingRefresh,
  isWide,
  showHomeApiErrorTester,
  disableEnrollmentActions,
  onToggleExpanded,
  onToggleHomeApiErrorTester,
  onToggleDisableEnrollmentActions,
  onTestTokenRefresh,
  onShowNotification,
}: DeveloperToolsCardProps) => {
  return (
    <Card className={`mb-6 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
      <CardHeader className="gap-0">
        <Button variant="ghost" className="justify-between px-0" onPress={onToggleExpanded}>
          <View className="flex-row items-center gap-2">
            <Feather name="terminal" size={18} color="#fafafa" />
            <CardTitle>Developer tools</CardTitle>
          </View>
          <Feather
            name={isExpanded ? "chevron-up" : "chevron-down"}
            size={18}
            color="#fafafa"
          />
        </Button>
      </CardHeader>
      {isExpanded ? (
        <CardContent className="gap-4">
          <Button
            variant="secondary"
            onPress={onTestTokenRefresh}
            disabled={isTestingRefresh}
          >
            <View className="flex-row items-center gap-2">
              {isTestingRefresh ? (
                <ActivityIndicator size="small" color="#fafafa" />
              ) : null}
              <Text className="text-secondary-foreground">
                {isTestingRefresh
                  ? "Testing refresh..."
                  : "Test access token refresh"}
              </Text>
            </View>
          </Button>

          <Button variant="secondary" onPress={onShowNotification}>
            <View className="flex-row items-center gap-2">
              <Feather name="bell" size={16} color="#fafafa" />
              <Text className="text-secondary-foreground">Show notification</Text>
            </View>
          </Button>

          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-foreground font-medium">
                Home API error button
              </Text>
              <Text className="text-muted-foreground text-xs">
                Show the test error control on Home.
              </Text>
            </View>
            <Switch
              value={showHomeApiErrorTester}
              onValueChange={onToggleHomeApiErrorTester}
            />
          </View>

          <View className="flex-row items-center justify-between gap-4">
            <View className="flex-1">
              <Text className="text-foreground font-medium">
                Show unenroll button
              </Text>
              <Text className="text-muted-foreground text-xs">
                Reveal the dev-only unenroll action in course details.
              </Text>
            </View>
            <Switch
              value={disableEnrollmentActions}
              onValueChange={onToggleDisableEnrollmentActions}
            />
          </View>
        </CardContent>
      ) : null}
    </Card>
  );
};
