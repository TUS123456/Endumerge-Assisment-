import api from './axios';
import type { Admission } from '../types';

export const admissionsApi = {
  list: (params?: Record<string, string>) => api.get<Admission[]>('/admissions', { params }).then((r) => r.data),
  get: (id: string) => api.get<Admission>(`/admissions/${id}`).then((r) => r.data),
  generate: (allocationId: string) => api.post<Admission>('/admissions', { allocationId }).then((r) => r.data),
  markFeePaid: (id: string) => api.post<Admission>(`/admissions/${id}/fee`).then((r) => r.data),
};
