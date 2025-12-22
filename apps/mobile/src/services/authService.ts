import * as SecureStore from 'expo-secure-store';
import apiClient from './apiClient';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth-login', credentials);
    await SecureStore.setItemAsync('accessToken', response.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.refreshToken);
    return response;
  },

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiClient.post<AuthResponse>('/api/auth-register', data);
    await SecureStore.setItemAsync('accessToken', response.accessToken);
    await SecureStore.setItemAsync('refreshToken', response.refreshToken);
    await SecureStore.deleteItemAsync('guestMode');
    return response;
  },

  async logout(): Promise<void> {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    await SecureStore.deleteItemAsync('guestMode');
  },

  async getCurrentUser() {
    try {
      const response = await apiClient.get<{ user: AuthResponse['user'] }>('/api/auth-me');
      console.log('getCurrentUser API response:', JSON.stringify(response, null, 2));
      if (!response || !response.user) {
        console.warn('getCurrentUser: No user in response');
        throw new Error('No user data received');
      }
      return response.user;
    } catch (error: any) {
      console.error('getCurrentUser error:', error?.response?.data || error?.message || error);
      throw error;
    }
  },

  async updateProfile(data: { name: string; email: string }) {
    const response = await apiClient.patch<{ user: AuthResponse['user'] }>('/api/auth-update', data);
    return response.user;
  },

  async isAuthenticated(): Promise<boolean> {
    const token = await SecureStore.getItemAsync('accessToken');
    return !!token;
  },

  async setGuestMode(): Promise<void> {
    await SecureStore.setItemAsync('guestMode', 'true');
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  },
};

