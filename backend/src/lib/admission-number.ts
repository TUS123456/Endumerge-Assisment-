import { prisma } from './prisma';

export class AdmissionAlreadyExistsError extends Error {
  constructor() {
    super('Admission number already generated for this allocation. It is immutable.');
    this.name = 'AdmissionAlreadyExistsError';
  }
}

export class FeeNotPaidError extends Error {
  constructor() {
    super('Admission can only be confirmed after fee is paid.');
    this.name = 'FeeNotPaidError';
  }
}

export async function generateAdmissionNumber(allocationId: string, createdBy: string) {
  return await prisma.$transaction(async (tx) => {
    // 1. Assert no admission exists yet
    const existing = await tx.admission.findUnique({
      where: { allocationId },
    });
    if (existing) throw new AdmissionAlreadyExistsError();

    // 2. Load allocation chain for prefix building
    const allocation = await tx.allocation.findUniqueOrThrow({
      where: { id: allocationId },
      include: {
        applicant: {
          include: {
            academicYear: true,
            program: {
              include: {
                department: {
                  include: {
                    campus: {
                      include: { institution: true },
                    },
                  },
                },
                courseType: true,
              },
            },
          },
        },
        quotaConfig: true,
      },
    });

    const institution = allocation.applicant.program.department.campus.institution;
    const courseType = allocation.applicant.program.courseType;
    const department = allocation.applicant.program.department;
    const academicYear = allocation.applicant.academicYear;
    const quotaType = allocation.quotaConfig.quotaType;

    // 3. Build prefix: INST/YEAR/COURSETYPE/DEPTCODE/QUOTA
    const prefix = `${institution.code}/${academicYear.startYear}/${courseType.code}/${department.code}/${quotaType}`;

    // 4. Count existing admissions with same prefix to get sequence
    const count = await tx.admission.count({
      where: {
        admissionNumber: {
          startsWith: prefix,
        },
      },
    });
    const sequence = String(count + 1).padStart(4, '0');
    const admissionNumber = `${prefix}/${sequence}`;

    // 5. Create Admission record (feeStatus = PENDING)
    const admission = await tx.admission.create({
      data: {
        applicantId: allocation.applicantId,
        allocationId,
        admissionNumber,
        feeStatus: 'PENDING',
      },
    });

    // 6. Audit log
    await tx.auditLog.create({
      data: {
        userId: createdBy,
        action: 'GENERATE_ADMISSION_NUMBER',
        entityType: 'Admission',
        entityId: admission.id,
        meta: JSON.stringify({ admissionNumber }),
      },
    });

    return admission;
  });
}
