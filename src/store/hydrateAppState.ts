import { useAuthStore } from "@features/auth/store/useAuthStore";
import { useBookmarkStore } from "@features/courses/store/useBookmarkStore";
import { useCoursesStore } from "@features/courses/store/useCoursesStore";
import { useEnrollmentStore } from "@features/courses/store/useEnrollmentStore";
import { useNetworkStore } from "@store/useNetworkStore";
import { usePreferencesStore } from "@store/usePreferencesStore";

let unsubscribeNetwork: (() => void) | null = null;

export const hydrateAppState = async (): Promise<void> => {
  if (!unsubscribeNetwork) {
    unsubscribeNetwork = useNetworkStore.getState().hydrate();
  }

  await Promise.all([
    usePreferencesStore.getState().hydrate(),
    useBookmarkStore.getState().hydrate(),
    useEnrollmentStore.getState().hydrate(),
    useCoursesStore.getState().hydrateCache(),
    useAuthStore.getState().checkAuth(),
  ]);
};
