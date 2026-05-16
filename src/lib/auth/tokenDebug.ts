import { readSecureStorageDebug } from "@lib/storage/secureStorage";
import { SECURE_STORAGE_KEYS } from "@lib/storage/storageKeys";

const preview = (value: string | null): string => {
  if (!value) {
    return "(empty)";
  }
  if (value.length <= 28) {
    return value;
  }
  return `${value.slice(0, 14)}…${value.slice(-10)} (${value.length} chars)`;
};

export const logTokenState = async (label: string): Promise<void> => {
  const access = await readSecureStorageDebug(SECURE_STORAGE_KEYS.accessToken);
  const refresh = await readSecureStorageDebug(SECURE_STORAGE_KEYS.refreshToken);

  console.log(`[TokenDebug] ${label}`, {
    accessMemory: preview(access.memory),
    accessSecureStore: preview(access.secureStore),
    refreshMemory: preview(refresh.memory),
    refreshSecureStore: preview(refresh.secureStore),
    memoryMatchesSecureStore:
      access.memory === access.secureStore &&
      refresh.memory === refresh.secureStore,
  });
};
