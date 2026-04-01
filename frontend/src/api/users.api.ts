import api from './axios';
import type { User } from '../types';

export const usersApi = {
  list: () => api.get<User[]>('/users').then((r) => r.data),
  create: (data: { name: string; email: string; password: string; role: string }) =>
    api.post<User>('/users', data).then((r) => r.data),
  update: (id: string, data: { name?: string; role?: string; isActive?: boolean }) =>
    api.put<User>(`/users/${id}`, data).then((r) => r.data),
};
