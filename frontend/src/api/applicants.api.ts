import api from './axios';
import type { Applicant, Document } from '../types';

export const applicantsApi = {
  list: (params?: Record<string, string>) => api.get<Applicant[]>('/applicants', { params }).then((r) => r.data),
  get: (id: string) => api.get<Applicant>(`/applicants/${id}`).then((r) => r.data),
  create: (data: Partial<Applicant>) => api.post<Applicant>('/applicants', data).then((r) => r.data),
  update: (id: string, data: Partial<Applicant>) => api.put<Applicant>(`/applicants/${id}`, data).then((r) => r.data),
  getDocuments: (id: string) => api.get<Document[]>(`/applicants/${id}/documents`).then((r) => r.data),
  updateDocuments: (id: string, updates: { id: string; status: string; remarks?: string }[]) =>
    api.put<Document[]>(`/applicants/${id}/documents`, updates).then((r) => r.data),
  allocate: (id: string, data: { quotaConfigId: string; allotmentNumber?: string; remarks?: string }) =>
    api.post(`/applicants/${id}/allocate`, data).then((r) => r.data),
};
