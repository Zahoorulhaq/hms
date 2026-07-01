import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { getSession, signOut } from 'next-auth/react';
import storage from '@/utils/storage';
import { Toast } from '@/components/Toast';
import { toString, get } from 'lodash';

// ---------------------------------------------------------------------------
// Retry queue – holds in-flight requests while a token refresh is in progress
// ---------------------------------------------------------------------------
let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: unknown) => void }[] = [];

const processQueue = (error: unknown, token: string | null = null): void => {
  failedQueue.forEach((p) => (token ? p.resolve(token) : p.reject(error)));
  failedQueue = [];
};

// ---------------------------------------------------------------------------
// Axios instance – Search micro-service
// ---------------------------------------------------------------------------
const searchHttp: AxiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_SEARCH_URL || '',
  timeout: 30_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

// ---------------------------------------------------------------------------
// Request interceptor – attach session Bearer token on every outgoing call
// ---------------------------------------------------------------------------
searchHttp.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const session = await getSession();
    config.headers['Authorization'] = `Bearer ${session?.user?.token}`;
    config.withCredentials = true;
    return config;
  },
  (error: AxiosError) => {
    console.error('[Search Request Error]', error);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Response interceptor – mirrors the session-expiry handling in https.ts
// ---------------------------------------------------------------------------
searchHttp.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = toString(get(error, 'response.status'));

    if (status === '401' && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = `Bearer ${token}`;
            return searchHttp(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;
      processQueue(error, null);
      isRefreshing = false;

      storage.removeItem('nextauth.message');
      await signOut({ redirect: true, callbackUrl: '/login' });
      Toast.error('Error', 'Your session has expired, please log in again.', { autoClose: 500 });
    }

    console.error(`[Search Response Error] ${status} - ${error.config?.url}`);
    return Promise.reject(error);
  }
);

// ---------------------------------------------------------------------------
// Public helper – typed GET with optional params
// ---------------------------------------------------------------------------
export const SEARCH_GET = <T = unknown>(
  endpoint: string,
  params?: Record<string, string | number | undefined>
): Promise<AxiosResponse<T>> => searchHttp.get<T>(endpoint, { params });

export default searchHttp;
