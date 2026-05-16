import type { LoginUser } from "@features/auth/types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@shared/components/ui/card";
import { Text, View } from "react-native";

interface AccountDetailsCardProps {
  user: LoginUser | null;
  isWide: boolean;
}

export const AccountDetailsCard = ({
  user,
  isWide,
}: AccountDetailsCardProps) => {
  return (
    <Card className={`mb-8 ${isWide ? "max-w-xl self-center w-full" : ""}`}>
      <CardHeader>
        <CardTitle>Account Details</CardTitle>
      </CardHeader>
      <CardContent className="gap-4">
        <View className="flex-row justify-between border-b border-border pb-2">
          <Text className="text-muted-foreground">User ID</Text>
          <Text className="text-foreground font-medium">
            {user?._id?.substring(0, 8)}...
          </Text>
        </View>
        <View className="flex-row justify-between border-b border-border pb-2">
          <Text className="text-muted-foreground">Role</Text>
          <Text className="text-foreground font-medium">{user?.role}</Text>
        </View>
        <View className="flex-row justify-between">
          <Text className="text-muted-foreground">Verified</Text>
          <Text
            className={user?.isEmailVerified ? "text-green-500" : "text-errorC"}
          >
            {user?.isEmailVerified ? "Yes" : "No"}
          </Text>
        </View>
      </CardContent>
    </Card>
  );
};
