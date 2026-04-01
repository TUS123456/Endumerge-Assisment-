import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
router.use(authenticate);

const schema = z.object({
  departmentId: z.string().min(1),
  courseTypeId: z.string().min(1),
  code: z.string().min(1).max(20),
  name: z.string().min(1),
  durationYears: z.number().int().min(1).max(6).optional(),
});

router.get('/', async (req, res: Response) => {
  const where: Record<string, unknown> = { isActive: true };
  if (req.query['departmentId']) where['departmentId'] = req.query['departmentId'];
  const data = await prisma.program.findMany({
    where,
    include: { department: { select: { name: true, code: true } }, courseType: { select: { code: true, name: true } } },
    orderBy: { name: 'asc' },
  });
  res.json(data);
});

router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.parse(req.body);
    const record = await prisma.program.create({ data: body });
    res.status(201).json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res: Response) => {
  const record = await prisma.program.findUnique({
    where: { id: req.params['id'] as string },
    include: { department: true, courseType: true },
  });
  if (!record) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(record);
});

router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.partial().parse(req.body);
    const record = await prisma.program.update({ where: { id: req.params['id'] as string }, data: body });
    res.json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res: Response) => {
  await prisma.program.update({ where: { id: req.params['id'] as string }, data: { isActive: false } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
