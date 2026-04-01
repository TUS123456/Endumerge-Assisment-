-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT');

-- CreateEnum
CREATE TYPE "QuotaType" AS ENUM ('KCET', 'COMEDK', 'MANAGEMENT', 'NRI', 'SNQ');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "Category" AS ENUM ('GM', 'SC', 'ST', 'OBC', 'EWS', 'CAT1', 'CAT2A', 'CAT2B', 'CAT3A', 'CAT3B', 'PH', 'NRI');

-- CreateEnum
CREATE TYPE "ApplicantStatus" AS ENUM ('PENDING', 'ALLOCATED', 'CONFIRMED', 'REJECTED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('SSLC_MARKS_CARD', 'PUC_MARKS_CARD', 'KCET_RANK_CARD', 'COMEDK_RANK_CARD', 'CATEGORY_CERTIFICATE', 'INCOME_CERTIFICATE', 'DOMICILE_CERTIFICATE', 'TRANSFER_CERTIFICATE', 'CONDUCT_CERTIFICATE', 'PASSPORT_PHOTO', 'AADHAR_CARD');

-- CreateEnum
CREATE TYPE "DocumentStatus" AS ENUM ('PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED');

-- CreateEnum
CREATE TYPE "FeeStatus" AS ENUM ('PENDING', 'PAID', 'WAIVED', 'REFUNDED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'ADMISSION_OFFICER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Institution" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Institution_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campus" (
    "id" TEXT NOT NULL,
    "institutionId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campus_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Department" (
    "id" TEXT NOT NULL,
    "campusId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Program" (
    "id" TEXT NOT NULL,
    "departmentId" TEXT NOT NULL,
    "courseTypeId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "durationYears" INTEGER NOT NULL DEFAULT 4,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Program_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AcademicYear" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "startYear" INTEGER NOT NULL,
    "endYear" INTEGER NOT NULL,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AcademicYear_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "CourseType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EntryType" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "EntryType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdmissionMode" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "AdmissionMode_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SeatMatrix" (
    "id" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "totalIntake" INTEGER NOT NULL,
    "isLocked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeatMatrix_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuotaConfig" (
    "id" TEXT NOT NULL,
    "seatMatrixId" TEXT NOT NULL,
    "quotaType" "QuotaType" NOT NULL,
    "totalSeats" INTEGER NOT NULL,
    "supernumerary" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuotaConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Applicant" (
    "id" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "academicYearId" TEXT NOT NULL,
    "programId" TEXT NOT NULL,
    "seatMatrixId" TEXT NOT NULL,
    "entryTypeId" TEXT NOT NULL,
    "admissionModeId" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "address" TEXT,
    "category" "Category" NOT NULL DEFAULT 'GM',
    "religion" TEXT,
    "domicileState" TEXT,
    "qualifyingExam" TEXT,
    "marksObtained" DOUBLE PRECISION,
    "maxMarks" DOUBLE PRECISION,
    "percentile" DOUBLE PRECISION,
    "rankNumber" TEXT,
    "status" "ApplicantStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Applicant_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Document" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "docType" "DocumentType" NOT NULL,
    "status" "DocumentStatus" NOT NULL DEFAULT 'PENDING',
    "remarks" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Document_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Allocation" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "quotaConfigId" TEXT NOT NULL,
    "allotmentNumber" TEXT,
    "allocatedBy" TEXT NOT NULL,
    "allocatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLocked" BOOLEAN NOT NULL DEFAULT true,
    "remarks" TEXT,

    CONSTRAINT "Allocation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Admission" (
    "id" TEXT NOT NULL,
    "applicantId" TEXT NOT NULL,
    "allocationId" TEXT NOT NULL,
    "admissionNumber" TEXT NOT NULL,
    "feeStatus" "FeeStatus" NOT NULL DEFAULT 'PENDING',
    "feePaidAt" TIMESTAMP(3),
    "feePaidBy" TEXT,
    "confirmedAt" TIMESTAMP(3),
    "confirmedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Admission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "meta" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Institution_code_key" ON "Institution"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Campus_institutionId_code_key" ON "Campus"("institutionId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "Department_campusId_code_key" ON "Department"("campusId", "code");

-- CreateIndex
CREATE UNIQUE INDEX "AcademicYear_label_key" ON "AcademicYear"("label");

-- CreateIndex
CREATE UNIQUE INDEX "CourseType_code_key" ON "CourseType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "EntryType_code_key" ON "EntryType"("code");

-- CreateIndex
CREATE UNIQUE INDEX "AdmissionMode_code_key" ON "AdmissionMode"("code");

-- CreateIndex
CREATE UNIQUE INDEX "SeatMatrix_programId_academicYearId_key" ON "SeatMatrix"("programId", "academicYearId");

-- CreateIndex
CREATE UNIQUE INDEX "QuotaConfig_seatMatrixId_quotaType_key" ON "QuotaConfig"("seatMatrixId", "quotaType");

-- CreateIndex
CREATE UNIQUE INDEX "Applicant_applicationNo_key" ON "Applicant"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "Document_applicantId_docType_key" ON "Document"("applicantId", "docType");

-- CreateIndex
CREATE UNIQUE INDEX "Allocation_applicantId_key" ON "Allocation"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_applicantId_key" ON "Admission"("applicantId");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_allocationId_key" ON "Admission"("allocationId");

-- CreateIndex
CREATE UNIQUE INDEX "Admission_admissionNumber_key" ON "Admission"("admissionNumber");

-- AddForeignKey
ALTER TABLE "Campus" ADD CONSTRAINT "Campus_institutionId_fkey" FOREIGN KEY ("institutionId") REFERENCES "Institution"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Department" ADD CONSTRAINT "Department_campusId_fkey" FOREIGN KEY ("campusId") REFERENCES "Campus"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES "Department"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Program" ADD CONSTRAINT "Program_courseTypeId_fkey" FOREIGN KEY ("courseTypeId") REFERENCES "CourseType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatMatrix" ADD CONSTRAINT "SeatMatrix_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeatMatrix" ADD CONSTRAINT "SeatMatrix_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuotaConfig" ADD CONSTRAINT "QuotaConfig_seatMatrixId_fkey" FOREIGN KEY ("seatMatrixId") REFERENCES "SeatMatrix"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_academicYearId_fkey" FOREIGN KEY ("academicYearId") REFERENCES "AcademicYear"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_programId_fkey" FOREIGN KEY ("programId") REFERENCES "Program"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_seatMatrixId_fkey" FOREIGN KEY ("seatMatrixId") REFERENCES "SeatMatrix"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_entryTypeId_fkey" FOREIGN KEY ("entryTypeId") REFERENCES "EntryType"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Applicant" ADD CONSTRAINT "Applicant_admissionModeId_fkey" FOREIGN KEY ("admissionModeId") REFERENCES "AdmissionMode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Document" ADD CONSTRAINT "Document_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Allocation" ADD CONSTRAINT "Allocation_quotaConfigId_fkey" FOREIGN KEY ("quotaConfigId") REFERENCES "QuotaConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_applicantId_fkey" FOREIGN KEY ("applicantId") REFERENCES "Applicant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Admission" ADD CONSTRAINT "Admission_allocationId_fkey" FOREIGN KEY ("allocationId") REFERENCES "Allocation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
