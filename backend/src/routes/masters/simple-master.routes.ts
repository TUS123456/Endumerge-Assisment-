// Generic simple master routes for CourseType, EntryType, AdmissionMode
import { Router, Response } from 'express';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/role.middleware';

type SimplePrismaDelegate = {
  findMany: (args: { where: { isActive: boolean }; orderBy: { name: string } }) => Promise<unknown[]>;
  findUnique: (args: { where: { id: string } }) => Promise<unknown>;
  create: (args: { data: { code: string; name: string } }) => Promise<unknown>;
  update: (args: { where: { id: string }; data: Record<string, unknown> }) => Promise<unknown>;
};

const schema = z.object({
  code: z.string().min(1).max(20),
  name: z.string().min(1),
});

export function createSimpleMasterRouter(
  getDelegate: (prisma: PrismaClient) => SimplePrismaDelegate,
  prisma: PrismaClient
) {
  const router = Router();
  router.use(authenticate);
  const delegate = getDelegate(prisma);

  router.get('/', async (_req, res: Response) => {
    const data = await delegate.findMany({ where: { isActive: true }, orderBy: { name: 'asc' } });
    res.json(data);
  });

  router.post('/', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
    try {
      const body = schema.parse(req.body);
      const record = await delegate.create({ data: body });
      res.status(201).json(record);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.get('/:id', async (req, res: Response) => {
    const record = await delegate.findUnique({ where: { id: req.params['id'] as string } });
    if (!record) { res.status(404).json({ message: 'Not found' }); return; }
    res.json(record);
  });

  router.put('/:id', requireRole('ADMIN'), async (req: AuthRequest, res: Response) => {
    try {
      const body = schema.partial().parse(req.body);
      const record = await delegate.update({ where: { id: req.params['id'] as string }, data: body });
      res.json(record);
    } catch (err) {
      if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  router.delete('/:id', requireRole('ADMIN'), async (req, res: Response) => {
    await delegate.update({ where: { id: req.params['id'] as string }, data: { isActive: false } });
    res.json({ message: 'Deleted successfully' });
  });

  return router;
}
