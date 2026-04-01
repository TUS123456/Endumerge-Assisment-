export type Role = 'ADMIN' | 'ADMISSION_OFFICER' | 'MANAGEMENT';
export type QuotaType = 'KCET' | 'COMEDK' | 'MANAGEMENT' | 'NRI' | 'SNQ';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';
export type Category = 'GM' | 'SC' | 'ST' | 'OBC' | 'EWS' | 'CAT1' | 'CAT2A' | 'CAT2B' | 'CAT3A' | 'CAT3B' | 'PH' | 'NRI';
export type ApplicantStatus = 'PENDING' | 'ALLOCATED' | 'CONFIRMED' | 'REJECTED' | 'CANCELLED';
export type DocumentStatus = 'PENDING' | 'SUBMITTED' | 'VERIFIED' | 'REJECTED';
export type DocumentType =
  | 'SSLC_MARKS_CARD' | 'PUC_MARKS_CARD' | 'KCET_RANK_CARD' | 'COMEDK_RANK_CARD'
  | 'CATEGORY_CERTIFICATE' | 'INCOME_CERTIFICATE' | 'DOMICILE_CERTIFICATE'
  | 'TRANSFER_CERTIFICATE' | 'CONDUCT_CERTIFICATE' | 'PASSPORT_PHOTO' | 'AADHAR_CARD';
export type FeeStatus = 'PENDING' | 'PAID' | 'WAIVED' | 'REFUNDED';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export interface Institution {
  id: string;
  code: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive: boolean;
}

export interface Campus {
  id: string;
  institutionId: string;
  code: string;
  name: string;
  isActive: boolean;
  institution?: { name: string };
}

export interface Department {
  id: string;
  campusId: string;
  code: string;
  name: string;
  isActive: boolean;
  campus?: { name: string };
}

export interface Program {
  id: string;
  departmentId: string;
  courseTypeId: string;
  code: string;
  name: string;
  durationYears: number;
  isActive: boolean;
  department?: { name: string; code: string };
  courseType?: { code: string; name: string };
}

export interface AcademicYear {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  isCurrent: boolean;
  isActive: boolean;
}

export interface CourseType { id: string; code: string; name: string; isActive: boolean; }
export interface EntryType { id: string; code: string; name: string; isActive: boolean; }
export interface AdmissionMode { id: string; code: string; name: string; isActive: boolean; }

export interface QuotaConfig {
  id: string;
  seatMatrixId: string;
  quotaType: QuotaType;
  totalSeats: number;
  supernumerary: number;
  filled?: number;
  remaining?: number;
}

export interface SeatMatrix {
  id: string;
  programId: string;
  academicYearId: string;
  totalIntake: number;
  isLocked: boolean;
  program?: Program;
  academicYear?: { label: string };
  quotas: QuotaConfig[];
}

export interface Document {
  id: string;
  applicantId: string;
  docType: DocumentType;
  status: DocumentStatus;
  remarks?: string;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Allocation {
  id: string;
  applicantId: string;
  quotaConfigId: string;
  allotmentNumber?: string;
  allocatedBy: string;
  isLocked: boolean;
  quotaConfig?: QuotaConfig;
}

export interface Admission {
  id: string;
  applicantId: string;
  allocationId: string;
  admissionNumber: string;
  feeStatus: FeeStatus;
  feePaidAt?: string;
  confirmedAt?: string;
}

export interface Applicant {
  id: string;
  applicationNo: string;
  academicYearId: string;
  programId: string;
  seatMatrixId: string;
  entryTypeId: string;
  admissionModeId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  email: string;
  phone: string;
  address?: string;
  category: Category;
  religion?: string;
  domicileState?: string;
  qualifyingExam?: string;
  marksObtained?: number;
  maxMarks?: number;
  percentile?: number;
  rankNumber?: string;
  status: ApplicantStatus;
  program?: { name: string; code: string };
  academicYear?: { label: string };
  admissionMode?: { name: string; code: string };
  entryType?: { name: string; code: string };
  documents?: Document[];
  allocation?: Allocation | null;
  admission?: Admission | null;
}

export interface DashboardStats {
  totalApplicants: number;
  allocated: number;
  confirmed: number;
  pendingFee: number;
  pendingDocuments: number;
}

export interface SeatSummaryItem {
  id: string;
  program: string;
  courseType: string;
  academicYear: string;
  totalIntake: number;
  totalAllocated: number;
  quotas: { quotaType: QuotaType; totalSeats: number; filled: number; remaining: number }[];
}

export interface DashboardData {
  stats: DashboardStats;
  seatSummary: SeatSummaryItem[];
  feePendingList: {
    id: string;
    admissionNumber: string;
    applicant: {
      firstName: string;
      lastName: string;
      applicationNo: string;
      phone: string;
      email: string;
      program: { name: string };
    };
  }[];
}
