import './config/env'; // load env vars first
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env';
import { prisma } from './lib/prisma';
import { createSimpleMasterRouter } from './routes/masters/simple-master.routes';

// Route imports
import authRoutes from './routes/auth.routes';
import institutionRoutes from './routes/masters/institution.routes';
import campusRoutes from './routes/masters/campus.routes';
import departmentRoutes from './routes/masters/department.routes';
import programRoutes from './routes/masters/program.routes';
import academicYearRoutes from './routes/masters/academic-year.routes';
import seatMatrixRoutes from './routes/seat-matrix.routes';
import applicantRoutes from './routes/applicant.routes';
import admissionRoutes from './routes/admission.routes';
import dashboardRoutes from './routes/dashboard.routes';
import usersRoutes from './routes/users.routes';

const app = express();

// Security & parsing middleware
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/masters/institutions', institutionRoutes);
app.use('/api/masters/campuses', campusRoutes);
app.use('/api/masters/departments', departmentRoutes);
app.use('/api/masters/programs', programRoutes);
app.use('/api/masters/academic-years', academicYearRoutes);
app.use('/api/masters/course-types', createSimpleMasterRouter((p) => p.courseType as never, prisma));
app.use('/api/masters/entry-types', createSimpleMasterRouter((p) => p.entryType as never, prisma));
app.use('/api/masters/admission-modes', createSimpleMasterRouter((p) => p.admissionMode as never, prisma));
app.use('/api/seat-matrix', seatMatrixRoutes);
app.use('/api/applicants', applicantRoutes);
app.use('/api/admissions', admissionRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', usersRoutes);

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// Start server
app.listen(5000, "0.0.0.0", () => {
  console.log("Server running on port 5000");
});
// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default app;