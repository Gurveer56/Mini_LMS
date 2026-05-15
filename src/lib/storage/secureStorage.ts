import * as SecureStore from 'expo-secure-store';

export const setData = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

export const getData = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

export const deleteData = async (key: string): Promise<void> => {
  await SecureStore.deleteItemAsync(key);
};
