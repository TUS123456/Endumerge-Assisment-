import api from './axios';
import type { Institution, Campus, Department, Program, AcademicYear, CourseType, EntryType, AdmissionMode } from '../types';

// Generic CRUD factory
function makeCrud<T>(path: string) {
  return {
    list: (params?: Record<string, string>) => api.get<T[]>(path, { params }).then((r) => r.data),
    get: (id: string) => api.get<T>(`${path}/${id}`).then((r) => r.data),
    create: (data: Partial<T>) => api.post<T>(path, data).then((r) => r.data),
    update: (id: string, data: Partial<T>) => api.put<T>(`${path}/${id}`, data).then((r) => r.data),
    remove: (id: string) => api.delete(`${path}/${id}`).then((r) => r.data),
  };
}

export const institutionsApi = makeCrud<Institution>('/masters/institutions');
export const campusesApi = makeCrud<Campus>('/masters/campuses');
export const departmentsApi = makeCrud<Department>('/masters/departments');
export const programsApi = makeCrud<Program>('/masters/programs');
export const academicYearsApi = makeCrud<AcademicYear>('/masters/academic-years');
export const courseTypesApi = makeCrud<CourseType>('/masters/course-types');
export const entryTypesApi = makeCrud<EntryType>('/masters/entry-types');
export const admissionModesApi = makeCrud<AdmissionMode>('/masters/admission-modes');
