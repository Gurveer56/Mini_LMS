import Toast from 'react-native-toast-message';
import { parseApiError } from '@lib/api/errors';

export const showApiErrorToast = (
  error: unknown,
  opts?: { title?: string },
) => {
  const apiErr = parseApiError(error);
  const title =
    opts?.title ??
    (apiErr.code === 'TIMEOUT'
      ? 'Request timed out'
      : apiErr.code === 'NETWORK'
      ? 'Network Error'
      : apiErr.code === 'UNAUTHORIZED'
      ? 'Unauthorized'
      : 'Error');

  Toast.show({
    type: 'error',
    text1: title,
    text2: apiErr.message,
  });

  return apiErr;
};
