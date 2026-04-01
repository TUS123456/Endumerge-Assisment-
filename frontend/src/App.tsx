import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { InstitutionPage } from './pages/masters/InstitutionPage';
import { CampusPage } from './pages/masters/CampusPage';
import { DepartmentPage } from './pages/masters/DepartmentPage';
import { ProgramPage } from './pages/masters/ProgramPage';
import { AcademicYearPage } from './pages/masters/AcademicYearPage';
import { CourseTypePage, EntryTypePage, AdmissionModePage } from './pages/masters/SimplePages';
import { SeatMatrixListPage } from './pages/seat-matrix/SeatMatrixListPage';
import { SeatMatrixNewPage } from './pages/seat-matrix/SeatMatrixNewPage';
import { SeatMatrixDetailPage } from './pages/seat-matrix/SeatMatrixDetailPage';
import { ApplicantListPage } from './pages/applicants/ApplicantListPage';
import { ApplicantNewPage } from './pages/applicants/ApplicantNewPage';
import { ApplicantDetailPage } from './pages/applicants/ApplicantDetailPage';
import { ApplicantDocumentsPage } from './pages/applicants/ApplicantDocumentsPage';
import { ApplicantAllocatePage } from './pages/applicants/ApplicantAllocatePage';
import { AdmissionListPage } from './pages/admissions/AdmissionListPage';
import { AdmissionDetailPage } from './pages/admissions/AdmissionDetailPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30_000, retry: 1 },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="masters/institution" element={<InstitutionPage />} />
              <Route path="masters/campus" element={<CampusPage />} />
              <Route path="masters/department" element={<DepartmentPage />} />
              <Route path="masters/program" element={<ProgramPage />} />
              <Route path="masters/academic-year" element={<AcademicYearPage />} />
              <Route path="masters/course-type" element={<CourseTypePage />} />
              <Route path="masters/entry-type" element={<EntryTypePage />} />
              <Route path="masters/admission-mode" element={<AdmissionModePage />} />
              <Route path="seat-matrix" element={<SeatMatrixListPage />} />
              <Route path="seat-matrix/new" element={<SeatMatrixNewPage />} />
              <Route path="seat-matrix/:id" element={<SeatMatrixDetailPage />} />
              <Route path="applicants" element={<ApplicantListPage />} />
              <Route path="applicants/new" element={<ApplicantNewPage />} />
              <Route path="applicants/:id" element={<ApplicantDetailPage />} />
              <Route path="applicants/:id/documents" element={<ApplicantDocumentsPage />} />
              <Route path="applicants/:id/allocate" element={<ApplicantAllocatePage />} />
              <Route path="admissions" element={<AdmissionListPage />} />
              <Route path="admissions/:id" element={<AdmissionDetailPage />} />
              <Route path="reports" element={<ReportsPage />} />
              <Route path="settings" element={<SettingsPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
