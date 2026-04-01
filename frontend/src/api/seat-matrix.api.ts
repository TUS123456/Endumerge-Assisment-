import api from './axios';
import type { SeatMatrix, QuotaConfig } from '../types';

export const seatMatrixApi = {
  list: () => api.get<SeatMatrix[]>('/seat-matrix').then((r) => r.data),
  get: (id: string) => api.get<SeatMatrix>(`/seat-matrix/${id}`).then((r) => r.data),
  seats: (id: string) => api.get<QuotaConfig[]>(`/seat-matrix/${id}/seats`).then((r) => r.data),
  create: (data: { programId: string; academicYearId: string; totalIntake: number; quotas: { quotaType: string; totalSeats: number; supernumerary?: number }[] }) =>
    api.post<SeatMatrix>('/seat-matrix', data).then((r) => r.data),
  update: (id: string, data: unknown) => api.put<SeatMatrix>(`/seat-matrix/${id}`, data).then((r) => r.data),
};
