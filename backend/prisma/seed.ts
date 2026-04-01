import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import 'dotenv/config';

const adapter = new PrismaPg({ connectionString: process.env['DATABASE_URL']! });
const prisma = new PrismaClient({ adapter });

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required env variable: ${key}`);
  return value;
}

async function main() {
  console.log('Seeding database...');

  // Course Types
  const courseTypes = [
    { code: 'UG', name: 'Under Graduate' },
    { code: 'PG', name: 'Post Graduate' },
    { code: 'DIPLOMA', name: 'Diploma' },
  ];
  for (const ct of courseTypes) {
    await prisma.courseType.upsert({ where: { code: ct.code }, update: {}, create: ct });
  }
  console.log('Course types seeded');

  // Entry Types
  const entryTypes = [
    { code: 'REGULAR', name: 'Regular' },
    { code: 'LATERAL', name: 'Lateral Entry' },
  ];
  for (const et of entryTypes) {
    await prisma.entryType.upsert({ where: { code: et.code }, update: {}, create: et });
  }
  console.log('Entry types seeded');

  // Admission Modes
  const admissionModes = [
    { code: 'GOVERNMENT', name: 'Government (KCET/COMEDK)' },
    { code: 'MANAGEMENT', name: 'Management Quota' },
  ];
  for (const am of admissionModes) {
    await prisma.admissionMode.upsert({ where: { code: am.code }, update: {}, create: am });
  }
  console.log('Admission modes seeded');

  // Default Academic Year
  await prisma.academicYear.upsert({
    where: { label: '2026-27' },
    update: {},
    create: { label: '2026-27', startYear: 2026, endYear: 2027, isCurrent: true },
  });
  console.log('Academic year seeded');

  // Admin User
  const adminEmail = requireEnv('SEED_ADMIN_EMAIL');
  const adminPassword = await bcrypt.hash(requireEnv('SEED_ADMIN_PASSWORD'), 10);
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { name: 'System Admin', email: adminEmail, password: adminPassword, role: 'ADMIN' },
  });

  // Admission Officer
  const officerEmail = requireEnv('SEED_OFFICER_EMAIL');
  const officerPassword = await bcrypt.hash(requireEnv('SEED_OFFICER_PASSWORD'), 10);
  await prisma.user.upsert({
    where: { email: officerEmail },
    update: {},
    create: { name: 'Admission Officer', email: officerEmail, password: officerPassword, role: 'ADMISSION_OFFICER' },
  });

  // Management User
  const mgmtEmail = requireEnv('SEED_MGMT_EMAIL');
  const mgmtPassword = await bcrypt.hash(requireEnv('SEED_MGMT_PASSWORD'), 10);
  await prisma.user.upsert({
    where: { email: mgmtEmail },
    update: {},
    create: { name: 'Management User', email: mgmtEmail, password: mgmtPassword, role: 'MANAGEMENT' },
  });

  console.log('Users seeded');
  console.log('\nSeed complete!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
