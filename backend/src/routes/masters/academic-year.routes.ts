import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../../lib/prisma';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

const router = Router();
router.use(authenticate);

const schema = z.object({
  label: z.string().min(1),
  startYear: z.number().int().min(2000),
  endYear: z.number().int().min(2001),
  isCurrent: z.boolean().optional(),
});

router.get('/', async (_req, res: Response) => {
  const data = await prisma.academicYear.findMany({ where: { isActive: true }, orderBy: { startYear: 'desc' } });
  res.json(data);
});

router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.parse(req.body);
    // If setting as current, clear other current flags
    if (body.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    const record = await prisma.academicYear.create({ data: body });
    res.status(201).json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/:id', async (req, res: Response) => {
  const record = await prisma.academicYear.findUnique({ where: { id: req.params['id'] as string } });
  if (!record) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(record);
});

router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const body = schema.partial().parse(req.body);
    if (body.isCurrent) {
      await prisma.academicYear.updateMany({ data: { isCurrent: false } });
    }
    const record = await prisma.academicYear.update({ where: { id: req.params['id'] as string }, data: body });
    res.json(record);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.delete('/:id', requireRole('ADMIN'), async (req, res: Response) => {
  await prisma.academicYear.update({ where: { id: req.params['id'] as string }, data: { isActive: false } });
  res.json({ message: 'Deleted successfully' });
});

export default router;
