import { prisma } from './prisma';

export class QuotaFullError extends Error {
  constructor(quotaType: string) {
    super(`Quota ${quotaType} is full. No seats available.`);
    this.name = 'QuotaFullError';
  }
}

export class ApplicantNotPendingError extends Error {
  constructor(status: string) {
    super(`Applicant is already processed (status: ${status}). Cannot allocate seat.`);
    this.name = 'ApplicantNotPendingError';
  }
}

interface AllocateSeatParams {
  applicantId: string;
  quotaConfigId: string;
  allocatedBy: string;
  allotmentNumber?: string;
  remarks?: string;
}

export async function allocateSeat(params: AllocateSeatParams) {
  const { applicantId, quotaConfigId, allocatedBy, allotmentNumber, remarks } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Load and validate applicant
    const applicant = await tx.applicant.findUniqueOrThrow({
      where: { id: applicantId },
    });

    if (applicant.status !== 'PENDING') {
      throw new ApplicantNotPendingError(applicant.status);
    }

    // 2. Load quota config
    const quotaConfig = await tx.quotaConfig.findUniqueOrThrow({
      where: { id: quotaConfigId },
    });

    // 3. Count current allocations for this quota
    const filledCount = await tx.allocation.count({
      where: {
        quotaConfigId,
        isLocked: true,
      },
    });

    // 4. Check availability
    if (filledCount >= quotaConfig.totalSeats) {
      throw new QuotaFullError(quotaConfig.quotaType);
    }

    // 5. Create allocation
    const allocation = await tx.allocation.create({
      data: {
        applicantId,
        quotaConfigId,
        allocatedBy,
        allotmentNumber,
        remarks,
        isLocked: true,
      },
    });

    // 6. Update applicant status
    await tx.applicant.update({
      where: { id: applicantId },
      data: { status: 'ALLOCATED' },
    });

    // 7. Write audit log
    await tx.auditLog.create({
      data: {
        userId: allocatedBy,
        action: 'ALLOCATE_SEAT',
        entityType: 'Allocation',
        entityId: allocation.id,
        meta: JSON.stringify({
          applicantId,
          quotaConfigId,
          quotaType: quotaConfig.quotaType,
          seatsRemaining: quotaConfig.totalSeats - filledCount - 1,
        }),
      },
    });

    return allocation;
  });
}
