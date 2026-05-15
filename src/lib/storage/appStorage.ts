import AsyncStorage from "@react-native-async-storage/async-storage";

const PREFIX = "@hoe_app:";

const storageKey = (key: string) => `${PREFIX}${key}`;

export const setAppStorage = async (
  key: string,
  value: string,
): Promise<void> => {
  await AsyncStorage.setItem(storageKey(key), value);
};

export const getAppStorage = async (key: string): Promise<string | null> => {
  return AsyncStorage.getItem(storageKey(key));
};

export const deleteAppStorage = async (key: string): Promise<void> => {
  await AsyncStorage.removeItem(storageKey(key));
};

export const setAppStorageJSON = async <T>(
  key: string,
  value: T,
): Promise<void> => {
  await setAppStorage(key, JSON.stringify(value));
};

export const getAppStorageJSON = async <T>(key: string): Promise<T | null> => {
  const raw = await getAppStorage(key);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};
