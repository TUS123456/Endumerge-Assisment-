import { Router, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { requireRole } from '../middleware/role.middleware';
import { allocateSeat, QuotaFullError, ApplicantNotPendingError } from '../lib/seat-allocator';

const router = Router();
router.use(authenticate);

const applicantSchema = z.object({
  academicYearId: z.string().min(1),
  programId: z.string().min(1),
  seatMatrixId: z.string().min(1),
  entryTypeId: z.string().min(1),
  admissionModeId: z.string().min(1),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  dateOfBirth: z.string().transform((s) => new Date(s)),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  email: z.string().email(),
  phone: z.string().min(10),
  address: z.string().optional(),
  category: z.enum(['GM', 'SC', 'ST', 'OBC', 'EWS', 'CAT1', 'CAT2A', 'CAT2B', 'CAT3A', 'CAT3B', 'PH', 'NRI']).optional(),
  religion: z.string().optional(),
  domicileState: z.string().optional(),
  qualifyingExam: z.string().optional(),
  marksObtained: z.number().optional(),
  maxMarks: z.number().optional(),
  percentile: z.number().optional(),
  rankNumber: z.string().optional(),
});

// Generate sequential applicationNo
async function generateApplicationNo(academicYear: { startYear: number }) {
  const count = await prisma.applicant.count({
    where: { academicYear: { startYear: academicYear.startYear } },
  });
  return `APP/${academicYear.startYear}/${String(count + 1).padStart(4, '0')}`;
}

// GET /api/applicants
router.get('/', async (req, res: Response) => {
  const where: Record<string, unknown> = {};
  if (req.query['status']) where['status'] = req.query['status'];
  if (req.query['programId']) where['programId'] = req.query['programId'];
  if (req.query['academicYearId']) where['academicYearId'] = req.query['academicYearId'];
  if (req.query['category']) where['category'] = req.query['category'];

  const applicants = await prisma.applicant.findMany({
    where,
    include: {
      program: { select: { name: true, code: true } },
      academicYear: { select: { label: true } },
      admissionMode: { select: { name: true, code: true } },
      entryType: { select: { name: true, code: true } },
      allocation: { include: { quotaConfig: { select: { quotaType: true } } } },
      admission: { select: { admissionNumber: true, feeStatus: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  res.json(applicants);
});

// POST /api/applicants
router.post('/', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const body = applicantSchema.parse(req.body);
    const academicYear = await prisma.academicYear.findUniqueOrThrow({ where: { id: body.academicYearId } });
    const applicationNo = await generateApplicationNo(academicYear);

    const applicant = await prisma.applicant.create({
      data: { ...body, applicationNo },
    });

    // Auto-create document checklist
    const docTypes = [
      'SSLC_MARKS_CARD', 'PUC_MARKS_CARD', 'KCET_RANK_CARD', 'COMEDK_RANK_CARD',
      'CATEGORY_CERTIFICATE', 'INCOME_CERTIFICATE', 'DOMICILE_CERTIFICATE',
      'TRANSFER_CERTIFICATE', 'CONDUCT_CERTIFICATE', 'PASSPORT_PHOTO', 'AADHAR_CARD',
    ] as const;

    await prisma.document.createMany({
      data: docTypes.map((docType) => ({ applicantId: applicant.id, docType })),
      skipDuplicates: true,
    });

    res.status(201).json(applicant);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/applicants/:id
router.get('/:id', async (req, res: Response) => {
  const applicant = await prisma.applicant.findUnique({
    where: { id: req.params['id'] as string },
    include: {
      program: { include: { department: { include: { campus: { include: { institution: true } } } }, courseType: true } },
      academicYear: true,
      entryType: true,
      admissionMode: true,
      documents: true,
      allocation: { include: { quotaConfig: true } },
      admission: true,
    },
  });
  if (!applicant) { res.status(404).json({ message: 'Not found' }); return; }
  res.json(applicant);
});

// PUT /api/applicants/:id
router.put('/:id', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const body = applicantSchema.partial().parse(req.body);
    const applicant = await prisma.applicant.update({ where: { id: req.params['id'] as string }, data: body });
    res.json(applicant);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// GET /api/applicants/:id/documents
router.get('/:id/documents', async (req, res: Response) => {
  const docs = await prisma.document.findMany({
    where: { applicantId: req.params['id'] as string },
    orderBy: { docType: 'asc' },
  });
  res.json(docs);
});

// PUT /api/applicants/:id/documents - bulk update doc statuses
router.put('/:id/documents', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const docUpdateSchema = z.array(z.object({
      id: z.string(),
      status: z.enum(['PENDING', 'SUBMITTED', 'VERIFIED', 'REJECTED']),
      remarks: z.string().optional(),
    }));

    const updates = docUpdateSchema.parse(req.body);
    const userId = req.user!.userId;

    await Promise.all(
      updates.map((u) =>
        prisma.document.update({
          where: { id: u.id },
          data: {
            status: u.status,
            remarks: u.remarks,
            verifiedBy: u.status === 'VERIFIED' ? userId : undefined,
            verifiedAt: u.status === 'VERIFIED' ? new Date() : undefined,
          },
        })
      )
    );

    const docs = await prisma.document.findMany({ where: { applicantId: req.params['id'] as string } });
    res.json(docs);
  } catch (err) {
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

// POST /api/applicants/:id/allocate - CORE seat allocation
router.post('/:id/allocate', requireRole('ADMIN', 'ADMISSION_OFFICER'), async (req: AuthRequest, res: Response) => {
  try {
    const body = z.object({
      quotaConfigId: z.string().min(1),
      allotmentNumber: z.string().optional(),
      remarks: z.string().optional(),
    }).parse(req.body);

    const allocation = await allocateSeat({
      applicantId: req.params['id'] as string,
      quotaConfigId: body.quotaConfigId,
      allocatedBy: req.user!.userId,
      allotmentNumber: body.allotmentNumber,
      remarks: body.remarks,
    });

    res.status(201).json(allocation);
  } catch (err) {
    if (err instanceof QuotaFullError) { res.status(409).json({ message: err.message }); return; }
    if (err instanceof ApplicantNotPendingError) { res.status(400).json({ message: err.message }); return; }
    if (err instanceof z.ZodError) { res.status(400).json({ errors: err.issues }); return; }
    res.status(500).json({ message: 'Internal server error' });
  }
});

export default router;
