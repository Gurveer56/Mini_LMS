import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getData, setData, deleteData } from '@lib/storage/secureStorage';

interface QueueItem {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

let isRefreshing = false;
let failedQueue: QueueItem[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((item) => {
    if (error) {
      item.reject(error);
    } else {
      item.resolve(token!);
    }
  });
  failedQueue = [];
};

export const apiClient = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL || 'https://api.freeapi.app/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await getData('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getData('refreshToken');

        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const { data } = await axios.post(
          `${apiClient.defaults.baseURL}/users/refresh-token`,
          {},
          {
            headers: {
              Authorization: `Bearer ${refreshToken}`,
            },
          }
        );

        const newAccessToken = data.data.accessToken;
        const newRefreshToken = data.data.refreshToken;

        await setData('accessToken', newAccessToken);
        await setData('refreshToken', newRefreshToken);

        processQueue(null, newAccessToken);

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);

        await deleteData('accessToken');
        await deleteData('refreshToken');
        await deleteData('user');

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const api = {
  get: <T>(url: string, params?: any) => apiClient.get<T>(url, { params }),
  post: <T>(url: string, data?: any) => apiClient.post<T>(url, data),
  put: <T>(url: string, data?: any) => apiClient.put<T>(url, data),
  patch: <T>(url: string, data?: any) => apiClient.patch<T>(url, data),
  delete: <T>(url: string) => apiClient.delete<T>(url),
};
