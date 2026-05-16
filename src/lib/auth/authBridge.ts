import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import { deleteSecureStorage } from "@lib/storage/secureStorage";
import { router } from "expo-router";

type SessionExpiredHandler = () => void;

let onSessionExpired: SessionExpiredHandler | null = null;

export const registerSessionExpiredHandler = (
  handler: SessionExpiredHandler,
): void => {
  onSessionExpired = handler;
};

export const clearAuthStorage = async (): Promise<void> => {
  await deleteSecureStorage(SECURE_STORAGE_KEYS.accessToken);
  await deleteSecureStorage(SECURE_STORAGE_KEYS.refreshToken);
  await deleteSecureStorage(SECURE_STORAGE_KEYS.user);
};

export const handleSessionExpired = async (): Promise<void> => {
  await clearAuthStorage();
  onSessionExpired?.();
  router.replace("/(auth)/welcome");
};
