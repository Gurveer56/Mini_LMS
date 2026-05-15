import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import * as SecureStore from "expo-secure-store";

export { SECURE_STORAGE_KEYS };

export const setSecureStorage = async (
  key: string,
  value: string,
): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

export const getSecureStorage = async (key: string): Promise<string | null> => {
  return SecureStore.getItemAsync(key);
};

export const deleteSecureStorage = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};
