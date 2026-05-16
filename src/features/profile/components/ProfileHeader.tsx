import { Feather } from "@expo/vector-icons";
import type { LoginUser } from "@features/auth/types";
import { Image } from "expo-image";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";

const AVATAR_SIZE = 96;

interface ProfileHeaderProps {
  user: LoginUser | null;
  avatarCacheKey: number;
  avatarUri?: string;
  isWide: boolean;
  isSavingAvatar: boolean;
  onPickAvatar: () => void;
}

export const ProfileHeader = ({
  user,
  avatarCacheKey,
  avatarUri,
  isWide,
  isSavingAvatar,
  onPickAvatar,
}: ProfileHeaderProps) => {
  const initial = user?.username?.charAt(0).toUpperCase();

  return (
    <View
      className={`items-center mb-8 ${isWide ? "max-w-xl self-center w-full" : ""}`}
    >
      <TouchableOpacity
        onPress={onPickAvatar}
        disabled={isSavingAvatar}
        activeOpacity={0.8}
        className="relative mb-4"
      >
        <View
          className="rounded-full bg-muted items-center justify-center border-2 border-primary overflow-hidden"
          style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
        >
          {avatarUri ? (
            <Image
              key={`${avatarUri}-${avatarCacheKey}`}
              source={{ uri: avatarUri }}
              style={{ width: AVATAR_SIZE, height: AVATAR_SIZE }}
              contentFit="cover"
              cachePolicy="none"
              transition={200}
            />
          ) : (
            <Text className="text-2xl font-bold text-foreground">
              {initial}
            </Text>
          )}
        </View>

        <View className="absolute bottom-0 right-0 bg-primary w-8 h-8 rounded-full items-center justify-center border-2 border-background">
          {isSavingAvatar ? (
            <ActivityIndicator size="small" color="#09090b" />
          ) : (
            <Feather name="camera" size={14} color="#09090b" />
          )}
        </View>
      </TouchableOpacity>

      <Text className="text-2xl font-bold text-foreground">
        {user?.username}
      </Text>
      <Text className="text-muted-foreground">{user?.email}</Text>
    </View>
  );
};
