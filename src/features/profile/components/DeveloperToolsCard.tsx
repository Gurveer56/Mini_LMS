import { Button } from "@shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { ActivityIndicator, Text, View } from "react-native";

interface DeveloperToolsCardProps {
  isTestingRefresh: boolean;
  isWide: boolean;
  onTestTokenRefresh: () => void;
}

export const DeveloperToolsCard = ({
  isTestingRefresh,
  isWide,
  onTestTokenRefresh,
}: DeveloperToolsCardProps) => {
  return (
    <Card className={`mb-6 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
      <CardHeader>
        <CardTitle>Developer tools</CardTitle>
      </CardHeader>
      <CardContent className="gap-3">
        <Text className="text-muted-foreground text-sm leading-5">
          Corrupts the access token, then calls the profile API. A successful
          refresh rotates the token without logging you out.
        </Text>
        <Button
          variant="secondary"
          onPress={onTestTokenRefresh}
          disabled={isTestingRefresh}
        >
          <View className="flex-row items-center gap-2">
            {isTestingRefresh ? (
              <ActivityIndicator size="small" color="#fafafa" />
            ) : null}
            <Text>
              {isTestingRefresh
                ? "Testing refresh..."
                : "Test access token refresh"}
            </Text>
          </View>
        </Button>
      </CardContent>
    </Card>
  );
};
