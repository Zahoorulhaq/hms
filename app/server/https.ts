import axios, { AxiosResponse, AxiosError } from 'axios';
import { getSession, signOut } from 'next-auth/react'; // Import getSession from NextAuth
import { Toast } from '@/components/Toast';
import { get, toString } from 'lodash';
import storage from '@/utils/storage';
import { ACTIVE_URLS } from '@/utils/constants';
const { ACTIVE_API_URL } = ACTIVE_URLS;

let isRefreshing = false;
let failedQueue: { resolve: (token: string) => void; reject: (error: any) => void }[] = [];

const session = getSession(); // Get the session to access the token

// Create the axios instance
const http = axios.create({
  baseURL: ACTIVE_API_URL || '',
  timeout: 60000, // Set a timeout of 1 minute
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: true,
});

http.interceptors.request.use(
  async (config) => {
    const session = await getSession(); // Get the session using getSession from NextAuth
    config.headers['Authorization'] = `Bearer ${session?.user?.token}`;
    config.withCredentials = true; // Ensure credentials are always sent with requests

    return config;
  },
  (error) => {
    console.error('[Request Error]', error);
    return Promise.reject(error);
  }
);

// Response Interceptor
http.interceptors.response.use(
  (response) => {
    // Handle successful response
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token;
            return http(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;
    }
    if (toString(get(error, 'response.status')) == '401') {
      // log out
      storage.removeItem('nextauth.message');
      storage.removeItem('leadHistory');
      storage.removeItem('listingHistory');
      storage.removeItem('contactsHistory');
      storage.removeItem('propertyHistory');
      storage.removeItem('agent');
      storage.removeItem('activityHistory');
      return await signOut({ redirect: true, callbackUrl: '/login' });
    }
    if (['401', '403', '410', '420', '502'].includes(error.response?.status.toString())) {
      const statusCode = error.response?.status;
      if (error?.response?.data?.message === 'Unauthenticated.') {
        signOut({ redirect: true, callbackUrl: '/login' });
        Toast.error('Error', 'Your session has been expired please log in again.', {
          autoClose: 500,
        });
        storage.removeItem('nextauth.message');
      } else {
        window.location.href = `/error?error=${statusCode}`; // Navigate to error page
      }
    }

    console.error(`[Response Error] ${error.response?.status} - ${error.response?.config?.url}`);
    return Promise.reject(error);
  }
);

// POST request function
export const POST_REQUEST = (endpoint: string, body?: any, config?: any) => {
  return new Promise((resolve, reject) => {
    const reqBody: any = { ...body };
    http
      .post(endpoint, reqBody)
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};

// GET request function
export const GET_REQUEST = (endpoint: string, params?: any, signal?: any) => {
  return new Promise((resolve, reject) => {
    http
      .get(endpoint, {
        params: { ...params },
        ...(signal ? { signal } : {}),
      })
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};

// GET request function specifically for blob responses
export const GET_BLOB_REQUEST = (endpoint: string, config?: any) => {
  return new Promise((resolve, reject) => {
    const requestConfig = {
      params: config?.params || {},
      responseType: 'blob' as const,
      headers: config?.headers || {},
      timeout: 300000, // 5 minutes — export queries can be slow
    };

    http
      .get(endpoint, requestConfig)
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};

// PUT request function
export const PUT_REQUEST = (endpoint: string, body?: any, config?: any) => {
  return new Promise((resolve, reject) => {
    const reqBody: any = { ...body };

    http
      .put(endpoint, { ...reqBody }, { ...config })
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};

// DELETE request function
export const DELETE_REQUEST = (endpoint: string, config?: any) => {
  return new Promise((resolve, reject) => {
    http
      .delete(endpoint, { ...config })
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};
export const LOGOUT_REQUEST = async (endpoint: string) => {
  const session = await getSession();
  return new Promise((resolve, reject) => {
    // Set default headers for the DELETE request

    fetch(endpoint, {
      body: JSON.stringify({}),
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        Authorization: `Bearer ${session?.user?.token}`,
      },
    })
      .then(async (response) => {
        if (!response.ok) {
          // Handle any non-2xx status as an error
          const errorResponse = await response.json();
          return reject(errorResponse);
        }
        // Parse response body if it's JSON
        return response.json();
      })
      .then((data) => {
        resolve(data); // Resolve with the parsed response data
      })
      .catch((error) => {
        reject(error); // Reject with the error
      });
  });
};

// PATCH request function
export const PATCH_REQUEST = (endpoint: string, body?: any, config?: any) => {
  return new Promise((resolve, reject) => {
    const reqBody: any = { ...body };

    http
      .patch(endpoint, { ...reqBody }, { ...config })
      .then((res: AxiosResponse) => resolve(res))
      .catch((err: AxiosError) => reject(err));
  });
};

export default http;
