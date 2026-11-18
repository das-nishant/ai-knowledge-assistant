import { api } from './api';
import type { AuthResponse, User } from '../types';

export const authService = {
  async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/register', {
      name,
      email,
      password,
    });
    return response.data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async getMe(): Promise<User> {
    const response = await api.get<User>('/auth/me');
    return response.data;
  },

  async updateProfile(name: string): Promise<User> {
    const response = await api.put<User>('/auth/profile', { name });
    return response.data;
  },

  async changePassword(current_password: string, new_password: string): Promise<{ message: string }> {
    const response = await api.put<{ message: string }>('/auth/change-password', {
      current_password,
      new_password,
    });
    return response.data;
  },
};
