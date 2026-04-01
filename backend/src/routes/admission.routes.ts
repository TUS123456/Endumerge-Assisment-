import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { generateAdmissionNumber, AdmissionAlreadyExistsError } from '../lib/admission-number';

const router = Router();
router.use(authenticate);

// GET /api/admissions
router.get('/', async (req, res: Response) => {
  const where: Record<string, unknown> = {};
  if (req.query['feeStatus']) where['feeStatus'] = req.query['feeStatus'];

  const admissions = await prisma.admission.findMany({
    where,
    include: {
      applicant: {
        include: {
          program: { select: { name: true, code: true } },
          academicYear: { select: { label: true } },
        },
      },
      allocation: { include: { quotaConfig: { select: { quotaType: true } } } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(admissions);
});

// POST /api/admissions - generate admission number
router.post('/', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({ allocationId: z.string().min(1) }).parse(req.body);
    const admission = await generateAdmissionNumber(body.allocationId, req.user!.userId);
    res.status(201).json(admission);
  } catch (err) {
    if (err instanceof AdmissionAlreadyExistsError) { res.status(409).json({ message: err.message }); return; }
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/admissions/:id
router.get('/:id', async (req, res: Response) => {
  const admission = await prisma.admission.findUnique({
    where: { id: req.params['id'] as string },
    include: {
      applicant: {
        include: {
          program: { include: { department: { include: { campus: { include: { institution: true } } } }, courseType: true } },
          academicYear: true,
          entryType: true,
          admissionMode: true,
          documents: true,
        },
      },
      allocation: { include: { quotaConfig: true } },
    },
  });
  if (!admission) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(admission);
});

// POST /api/admissions/:id/fee - mark fee paid & confirm
router.post('/:id/fee', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const admission = await prisma.admission.findUnique({ where: { id: req.params['id'] as string } });
    if (!admission) { res.status(404).json({ message: 'Not found' }); return; }
    if (admission.feeStatus === 'PAID') { res.status(400).json({ message: 'Fee already marked as paid' }); return; }

    const now = new Date();
    const updated = await prisma.admission.update({
      where: { id: req.params['id'] as string },
      data: {
        feeStatus: 'PAID',
        feePaidAt: now,
        feePaidBy: req.user!.userId,
        confirmedAt: now,
        confirmedBy: req.user!.userId,
      },
    });

    // Update applicant status to CONFIRMED
    await prisma.applicant.update({
      where: { id: admission.applicantId },
      data: { status: 'CONFIRMED' },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: req.user!.userId,
        action: 'CONFIRM_ADMISSION',
        entityType: 'Admission',
        entityId: admission.id,
        meta: JSON.stringify({ admissionNumber: admission.admissionNumber }),
      },
    });

    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
