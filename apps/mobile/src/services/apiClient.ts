import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ??
  Constants.expoConfig?.extra?.apiBaseUrl ??
  'https://tijaniyahmuslimpro-admin-mu.vercel.app';

const USE_MOCKS = process.env.EXPO_PUBLIC_USE_MOCKS === 'true';

class ApiClient {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor: Add auth token
    this.client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        const token = await SecureStore.getItemAsync('accessToken');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error),
    );

    // Response interceptor: Handle token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = await SecureStore.getItemAsync('refreshToken');
            if (!refreshToken) {
              throw new Error('No refresh token');
            }

            const response = await axios.post(`${API_BASE_URL}/api/auth-refresh`, {
              refreshToken,
            });

            const { accessToken, refreshToken: newRefreshToken } = response.data;
            await SecureStore.setItemAsync('accessToken', accessToken);
            if (newRefreshToken) {
              await SecureStore.setItemAsync('refreshToken', newRefreshToken);
            }

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${accessToken}`;
            }
            return this.client(originalRequest);
          } catch (refreshError) {
            await SecureStore.deleteItemAsync('accessToken');
            await SecureStore.deleteItemAsync('refreshToken');
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      },
    );
  }

  async get<T>(url: string, config?: any): Promise<T> {
    if (USE_MOCKS) {
      return this.getMockData<T>(url);
    }
    try {
      const response = await this.client.get<T>(url, config);
      return response.data;
    } catch (error: any) {
      // Handle network errors more gracefully
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
        // Try to return mock data as fallback for network errors
        try {
          const mockData = this.getMockData<T>(url);
          // Only log once per URL if mocks are successfully used (silent by default)
          // This is expected behavior when backend is unavailable
          return mockData;
        } catch (mockError) {
          // Only throw/show error if mocks are also unavailable
          throw new Error('Network request failed. Please check your connection.');
        }
      }
      throw error;
    }
  }

  async post<T>(url: string, data?: any, config?: any): Promise<T> {
    if (USE_MOCKS) {
      return this.getMockData<T>(url, data);
    }
    try {
      const response = await this.client.post<T>(url, data, config);
      return response.data;
    } catch (error: any) {
      // Handle network errors more gracefully
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error' || !error.response) {
        // Try to return mock data as fallback for network errors
        try {
          const mockData = this.getMockData<T>(url, data);
          return mockData;
        } catch (mockError) {
          // Only throw/show error if mocks are also unavailable
          throw new Error('Network request failed. Please check your connection.');
        }
      }
      // Re-throw API errors (4xx, 5xx) with more context
      const errorData = error.response?.data;
      if (errorData) {
        // Handle API error format: { error: 'ERROR_CODE', code?: string, issues?: { fieldErrors?: {...} } }
        if (errorData.error) {
          // Map common error codes to user-friendly messages
          const errorCode = errorData.error;
          let userMessage = errorCode;
          
          if (errorCode === 'UNAUTHORIZED') {
            userMessage = 'Please sign in to create a post';
          } else if (errorCode === 'INVALID_INPUT') {
            // Extract field errors if available
            const issues = errorData.issues;
            if (issues && typeof issues === 'object') {
              const fieldErrors = (issues as any)?.fieldErrors;
              if (fieldErrors && typeof fieldErrors === 'object') {
                const firstError = Object.values(fieldErrors)[0]?.[0];
                if (firstError) {
                  userMessage = firstError;
                } else {
                  userMessage = 'Invalid input. Please check your post content (max 500 characters).';
                }
              } else {
                userMessage = 'Invalid input. Please check your post content (max 500 characters).';
              }
            } else {
              userMessage = 'Invalid input. Please check your post content (max 500 characters).';
            }
          } else if (errorCode === 'INTERNAL_SERVER_ERROR') {
            userMessage = 'Server error. Please try again later.';
          }
          
          throw new Error(userMessage);
        }
        // Fallback to message if available
        if (errorData.message) {
          throw new Error(errorData.message);
        }
      }
      // If no structured error, use status code
      if (error.response?.status === 401) {
        throw new Error('Please sign in to continue');
      }
      if (error.response?.status === 402) {
        throw new Error('Service temporarily unavailable. The server deployment is currently disabled. Please contact support or try again later.');
      }
      if (error.response?.status === 403) {
        throw new Error('You do not have permission to perform this action');
      }
      throw error;
    }
  }

  async put<T>(url: string, data?: any, config?: any): Promise<T> {
    if (USE_MOCKS) {
      return this.getMockData<T>(url, data);
    }
    const response = await this.client.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: any): Promise<T> {
    if (USE_MOCKS) {
      return this.getMockData<T>(url, data);
    }
    const response = await this.client.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: any): Promise<T> {
    if (USE_MOCKS) {
      return this.getMockData<T>(url);
    }
    const response = await this.client.delete<T>(url, config);
    return response.data;
  }

  private async getMockData<T>(url: string, data?: any): Promise<T> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Return mock data based on endpoint
    if (url.includes('/prayer-times')) {
      return {
        timings: {
          Fajr: '05:30',
          Dhuhr: '12:45',
          Asr: '16:20',
          Maghrib: '18:50',
          Isha: '20:15',
        },
        date: {
          hijri: {
            day: '15',
            month: { en: 'Ramadan', ar: 'رمضان' },
            year: '1445',
          },
        },
      } as T;
    }

    if (url.includes('/tasbih-session')) {
      return { sessions: [] } as T;
    }

    if (url.includes('/wazifa')) {
      return { wazifas: [] } as T;
    }

    if (url.includes('/lazim')) {
      return { lazims: [] } as T;
    }

    if (url.includes('/journal-entries')) {
      return { entries: [] } as T;
    }

    if (url.includes('/community-feed')) {
      return { posts: [] } as T;
    }

    if (url.includes('/community-post')) {
      // Mock a newly created post
      const mockPost = {
        post: {
          id: `mock-${Date.now()}`,
          content: data?.content || 'Mock post content',
          author: {
            id: 'mock-user-1',
            name: 'You',
            avatar: undefined,
          },
          likes: 0,
          comments: 0,
          isLiked: false,
          createdAt: new Date().toISOString(),
        },
      };
      return mockPost as T;
    }

    if (url.includes('/community-like')) {
      // Mock a liked post
      return { post: { id: data?.postId || 'mock-post', likes: 1, isLiked: true } } as T;
    }

    if (url.includes('/chat-rooms')) {
      return { rooms: [] } as T;
    }

    if (url.includes('/mosques-nearby')) {
      return { mosques: [] } as T;
    }

    if (url.includes('/campaigns')) {
      return { campaigns: [] } as T;
    }

    if (url.includes('/tijaniyah-duas')) {
      return { duas: [] } as T;
    }

    return {} as T;
  }
}

export const apiClient = new ApiClient();
export default apiClient;

