import { Button } from "@shared/components/ui/button";
import { Text } from "react-native";

interface ProfileLogoutButtonProps {
  isWide: boolean;
  onLogout: () => void;
}

export const ProfileLogoutButton = ({
  isWide,
  onLogout,
}: ProfileLogoutButtonProps) => {
  return (
    <Button
      variant="destructive"
      className={`w-full ${isWide ? "max-w-xl self-center" : ""}`}
      onPress={onLogout}
    >
      <Text>Logout</Text>
    </Button>
  );
};
