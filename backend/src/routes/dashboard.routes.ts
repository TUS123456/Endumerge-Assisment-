import { Router, Response } from 'express';
import { prisma } from '../lib/prisma';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

// GET /api/dashboard
router.get('/', async (_req, res: Response) => {
  try {
    const [
      totalApplicants,
      allocatedCount,
      confirmedCount,
      pendingFeeCount,
      pendingDocCount,
      seatMatrices,
    ] = await Promise.all([
      prisma.applicant.count(),
      prisma.applicant.count({ where: { status: 'ALLOCATED' } }),
      prisma.applicant.count({ where: { status: 'CONFIRMED' } }),
      prisma.admission.count({ where: { feeStatus: 'PENDING' } }),
      // Applicants with at least one unverified doc
      prisma.applicant.count({
        where: {
          documents: { some: { status: { in: ['PENDING', 'SUBMITTED'] } } },
          status: { not: 'CANCELLED' },
        },
      }),
      prisma.seatMatrix.findMany({
        include: {
          program: { include: { department: { select: { name: true, code: true } }, courseType: { select: { code: true } } } },
          academicYear: { select: { label: true } },
          quotas: {
            include: {
              _count: { select: { allocations: { where: { isLocked: true } } } },
            },
          },
        },
      }),
    ]);

    const seatSummary = seatMatrices.map((m) => ({
      id: m.id,
      program: `${m.program.department.code} - ${m.program.name}`,
      courseType: m.program.courseType.code,
      academicYear: m.academicYear.label,
      totalIntake: m.totalIntake,
      totalAllocated: m.quotas.reduce((sum, q) => sum + q._count.allocations, 0),
      quotas: m.quotas.map((q) => ({
        quotaType: q.quotaType,
        totalSeats: q.totalSeats,
        filled: q._count.allocations,
        remaining: q.totalSeats - q._count.allocations,
      })),
    }));

    // Fee pending list (top 20)
    const feePendingList = await prisma.admission.findMany({
      where: { feeStatus: 'PENDING' },
      include: {
        applicant: {
          select: { firstName: true, lastName: true, applicationNo: true, phone: true, email: true, program: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: 'asc' },
      take: 20,
    });

    res.json({
      stats: {
        totalApplicants,
        allocated: allocatedCount,
        confirmed: confirmedCount,
        pendingFee: pendingFeeCount,
        pendingDocuments: pendingDocCount,
      },
      seatSummary,
      feePendingList,
    });
  } catch {
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
