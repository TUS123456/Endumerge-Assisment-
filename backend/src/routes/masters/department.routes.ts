import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
router.use(authenticate);

const schema = z.object({
  campusId: z.string().min(1),
  code: z.string().min(1).max(20),
  name: z.string().min(1),
});

router.get('/', async (req, res: Response) => {
  const where: Record<string, unknown> = { isActive: true };
  if (req.query['campusId']) where['campusId'] = req.query['campusId'];
  const data = await prisma.department.findMany({ where, include: { campus: { select: { name: true } } }, orderBy: { name: 'asc' } });
  res.json(data);
});

router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.parse(req.body);
    const record = await prisma.department.create({ data: body });
    res.status(201).json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res: Response) => {
  const record = await prisma.department.findUnique({ where: { id: req.params['id'] as string }, include: { campus: true } });
  if (!record) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(record);
});

router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.partial().parse(req.body);
    const record = await prisma.department.update({ where: { id: req.params['id'] as string }, data: body });
    res.json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res: Response) => {
  await prisma.department.update({ where: { id: req.params['id'] as string }, data: { isActive: false } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
