import { Router, Response } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';

const router = Router();
router.use(authenticate, requireRole('ADMIN'));

const createSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT']),
});

router.get('/', async (_req, res: Response) => {
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    orderBy: { name: 'asc' },
  });
  res.json(users);
});

router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const body = createSchema.parse(req.body);
    const existing = await prisma.user.findUnique({ where: { email: body.email } });
    if (existing) { res.status(409).json({ message: 'Email already exists' }); return; }

    const hashed = await bcrypt.hash(body.password, 10);
    const user = await prisma.user.create({
      data: { ...body, password: hashed },
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.status(201).json(user);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      name: z.string().optional(),
      role: z.enum(['ADMIN', 'ADMISSION_OFFICER', 'MANAGEMENT']).optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);
    const user = await prisma.user.update({
      where: { id: req.params['id'] as string },
      data: body,
      select: { id: true, name: true, email: true, role: true, isActive: true },
    });
    res.json(user);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
