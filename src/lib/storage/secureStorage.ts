import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";
import * as SecureStore from "expo-secure-store";

export { SECURE_STORAGE_KEYS };

type SecureCache = Map<string, string>;

/** Shared across bundles — avoids duplicate module instances losing the in-memory cache. */
const getMemoryCache = (): SecureCache => {
  const globalScope = globalThis as typeof globalThis & {
    __hoeSecureCache?: SecureCache;
  };
  if (!globalScope.__hoeSecureCache) {
    globalScope.__hoeSecureCache = new Map();
  }
  return globalScope.__hoeSecureCache;
};

export const setSecureStorage = async (
  key: string,
  value: string,
): Promise<void> => {
  getMemoryCache().set(key, value);
  await SecureStore.setItemAsync(key, value);
};

export const getSecureStorage = async (key: string): Promise<string | null> => {
  const memoryValue = getMemoryCache().get(key);
  if (memoryValue !== undefined) {
    return memoryValue;
  }

  const stored = await SecureStore.getItemAsync(key);
  if (stored !== null) {
    getMemoryCache().set(key, stored);
  }
  return stored;
};

export const deleteSecureStorage = async (key: string): Promise<void> => {
  getMemoryCache().delete(key);
  await SecureStore.deleteItemAsync(key);
};

export const clearSecureStorageCache = (): void => {
  getMemoryCache().clear();
};

/** Debug: compare in-memory vs SecureStore values. */
export const readSecureStorageDebug = async (
  key: string,
): Promise<{ memory: string | null; secureStore: string | null }> => {
  const memory = getMemoryCache().get(key) ?? null;
  const secureStore = await SecureStore.getItemAsync(key);
  return { memory, secureStore };
};
