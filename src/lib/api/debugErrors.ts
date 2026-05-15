let pendingCourseApiFailure = false;

export const triggerDummyCourseApiError = (): void => {
  pendingCourseApiFailure = true;
};

export const consumeDummyCourseApiError = (): boolean => {
  if (!pendingCourseApiFailure) {
    return false;
  }
  pendingCourseApiFailure = false;
  return true;
};

export const isDummyCourseApiErrorPending = (): boolean =>
  pendingCourseApiFailure;
