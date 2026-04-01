import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate);

const quotaSchema = z.object({
  quotaType: z.enum(['KCET', 'COMEDK', 'MANAGEMENT', 'NRI', 'SNQ']),
  totalSeats: z.number().int().min(0),
  supernumerary: z.number().int().min(0).optional(),
});

const createSchema = z.object({
  programId: z.string().min(1),
  academicYearId: z.string().min(1),
  totalIntake: z.number().int().min(1),
  quotas: z.array(quotaSchema).min(1),
}).refine(
  (data) => data.quotas.reduce((sum, q) => sum + q.totalSeats, 0) === data.totalIntake,
  { message: 'Sum of all quota seats must equal total intake' }
);

// GET /api/seat-matrix - list with seat fill counts
router.get('/', async (_req, res: Response) => {
  const matrices = await prisma.seatMatrix.findMany({
    include: {
      program: { include: { department: { select: { name: true, code: true } }, courseType: { select: { code: true } } } },
      academicYear: { select: { label: true } },
      quotas: {
        include: {
          _count: { select: { allocations: { where: { isLocked: true } } } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const result = matrices.map((m) => ({
    ...m,
    quotas: m.quotas.map((q) => ({
      ...q,
      filled: q._count.allocations,
      remaining: q.totalSeats - q._count.allocations,
    })),
  }));

  res.json(result);
});

// POST /api/seat-matrix
router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body);
    const matrix = await prisma.seatMatrix.create({
      data: {
        programId: body.programId,
        academicYearId: body.academicYearId,
        totalIntake: body.totalIntake,
        quotas: {
          create: body.quotas.map((q) => ({
            quotaType: q.quotaType,
            totalSeats: q.totalSeats,
            supernumerary: q.supernumerary ?? 0,
          })),
        },
      },
      include: { quotas: true },
    });
    res.status(201).json(matrix);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ message: err.issues[0]?.message ?? 'Validation error', errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/seat-matrix/:id
router.get('/:id', async (req, res: Response) => {
  const matrix = await prisma.seatMatrix.findUnique({
    where: { id: req.params['id'] as string },
    include: {
      program: { include: { department: { include: { campus: { include: { institution: true } } } }, courseType: true } },
      academicYear: true,
      quotas: {
        include: {
          _count: { select: { allocations: { where: { isLocked: true } } } },
        },
      },
    },
  });

  if (!matrix) { res.status(404).json({ message: 'Not found' }); return; }

  res.json({
    ...matrix,
    quotas: matrix.quotas.map((q) => ({
      ...q,
      filled: q._count.allocations,
      remaining: q.totalSeats - q._count.allocations,
    })),
  });
});

// GET /api/seat-matrix/:id/seats - live availability
router.get('/:id/seats', async (req, res: Response) => {
  const quotas = await prisma.quotaConfig.findMany({
    where: { seatMatrixId: req.params['id'] as string },
    include: {
      _count: { select: { allocations: { where: { isLocked: true } } } },
    },
  });

  res.json(
    quotas.map((q) => ({
      id: q.id,
      quotaType: q.quotaType,
      totalSeats: q.totalSeats,
      supernumerary: q.supernumerary,
      filled: q._count.allocations,
      remaining: q.totalSeats - q._count.allocations,
    }))
  );
});

// PUT /api/seat-matrix/:id
router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const matrix = await prisma.seatMatrix.findUnique({ where: { id: req.params['id'] as string } });
    if (!matrix) { res.status(404).json({ message: 'Not found' }); return; }
    if (matrix.isLocked) { res.status(400).json({ message: 'Seat matrix is locked and cannot be modified' }); return; }

    const body = createSchema.parse(req.body);

    // Delete and recreate quotas (only if not locked)
    await prisma.quotaConfig.deleteMany({ where: { seatMatrixId: req.params['id'] as string } });
    const updated = await prisma.seatMatrix.update({
      where: { id: req.params['id'] as string },
      data: {
        totalIntake: body.totalIntake,
        quotas: { create: body.quotas.map((q) => ({ quotaType: q.quotaType, totalSeats: q.totalSeats, supernumerary: q.supernumerary ?? 0 })) },
      },
      include: { quotas: true },
    });
    res.json(updated);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ message: err.issues[0]?.message ?? 'Validation error', errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
