# EduMerge — Admission Management System

A full-stack web application to manage the complete student admission lifecycle — from institutional setup and seat matrix configuration to applicant registration, seat allocation, document verification, and admission confirmation.

---

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite 8
- Tailwind CSS 4
- TanStack Query (React Query)
- React Hook Form + Zod
- React Router DOM 7
- Axios

**Backend**
- Node.js + Express 5 + TypeScript
- Prisma ORM 7 (with `@prisma/adapter-pg`)
- PostgreSQL 16
- JWT Authentication (`jsonwebtoken`)
- bcryptjs, Helmet, CORS, Zod

**Infrastructure**
- Docker + Docker Compose (PostgreSQL)

---

## Project Structure

```
edumerge/
├── frontend/               # React app (Vite)
│   └── src/
│       ├── api/            # Axios API clients
│       ├── components/     # Shared UI components
│       ├── pages/          # Route-level pages
│       ├── hooks/          # Custom React hooks
│       └── types/          # TypeScript type definitions
│
├── backend/                # Express API server
│   ├── src/
│   │   ├── config/         # Environment config
│   │   ├── lib/            # Prisma client, JWT, seat allocator, admission number
│   │   ├── middleware/      # Auth middleware
│   │   └── routes/         # API route handlers
│   │       └── masters/    # Master data routes
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   ├── seed.ts         # Default seed data
│   │   └── migrations/     # Migration history
│   ├── .env.example        # Environment variable template
│   └── prisma.config.ts    # Prisma 7 datasource config
│
├── .env.example            # Docker environment template
└── docker-compose.yml      # PostgreSQL container
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd edumerge
```

### 2. Configure environment files

**Root `.env`** (for Docker Compose) — copy from template:
```bash
cp .env.example .env
```

Edit `.env` and fill in your values:
```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<your-db-password>
POSTGRES_DB=edumerge
POSTGRES_PORT=5432
```

**Backend `.env`** — copy from template:
```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and fill in your values:
```env
DATABASE_URL="postgresql://<user>:<password>@localhost:5432/edumerge?schema=public"
JWT_SECRET="<generate-a-strong-random-secret>"
JWT_EXPIRES_IN="7d"
PORT=5000
FRONTEND_URL="http://localhost:5173"
```

> Generate a strong JWT secret with: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`

---

### 3. Start PostgreSQL with Docker

```bash
docker-compose up -d
```

This starts a PostgreSQL 16 container with a persistent volume.

> If port `5432` is already in use, set `POSTGRES_PORT=5433` in your root `.env` and update `DATABASE_URL` in `backend/.env` to use `localhost:5433`.

Useful Docker commands:
```bash
docker ps                          # Check container status
docker logs edumerge-postgres      # View logs
docker-compose down                # Stop container
docker-compose down -v             # Stop and wipe all data
```

---

### 4. Install Dependencies

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

---

### 5. Run Migrations & Seed

```bash
cd backend

# Migrate + seed in one command
npm run db:setup
```

Seed creates default accounts for each role. Credentials are printed to the console after seeding.

---

### 6. Start the Application

**Backend** (runs on `http://localhost:5000`):
```bash
cd backend
npm run dev
```

**Frontend** (runs on `http://localhost:5173`):
```bash
cd frontend
npm run dev
```

---

## Available Scripts

### Backend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start dev server with nodemon |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm run start` | Start compiled production server |
| `npm run db:setup` | Migrate + seed in one command |
| `npm run db:migrate` | Run Prisma migrations only |
| `npm run db:generate` | Regenerate Prisma client |
| `npm run db:seed` | Seed default data only |
| `npm run db:studio` | Open Prisma Studio (DB browser) |

### Frontend

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

---

## User Roles

| Role | Permissions |
|------|-------------|
| **ADMIN** | Full access — manage users, masters, seat matrices, allocations, admissions |
| **ADMISSION_OFFICER** | Register applicants, verify documents, allocate seats, confirm admissions |
| **MANAGEMENT** | Read-only access — dashboard, reports, applicant and admission browsing |

---

## System Flow

### 1. Admin Setup
1. Login as Admin
2. Create **Institution → Campus → Department → Program** hierarchy
3. Configure **Academic Year**, **Course Types**, **Entry Types**, **Admission Modes**
4. Define **Seat Matrix** per Program + Academic Year with quota breakdown (KCET, COMEDK, MANAGEMENT, NRI, SNQ)

### 2. Applicant Registration (Officer)
1. Go to **Applicants → New Applicant**
2. Fill personal details, category, exam scores
3. Select Program, Academic Year, Admission Mode
4. System auto-generates an **11-document checklist**

### 3. Document Verification (Officer)
1. Open applicant → **Documents** tab
2. Mark each document: `PENDING → SUBMITTED → VERIFIED` (or `REJECTED`)

### 4. Seat Allocation (Officer)
1. Open applicant → **Allocate Seat**
2. View real-time quota availability
3. Select quota → system validates seats atomically
4. Applicant status: `PENDING → ALLOCATED`

### 5. Generate Admission Number (Officer)
1. Click **Generate Admission Number** on allocated applicant
2. System generates: `INST/YEAR/COURSETYPE/DEPT/QUOTA/SEQ`
   - Example: `KLE/2026/UG/CSE/KCET/0001`

### 6. Confirm Admission (Officer)
1. Go to **Admissions** → open record → **Mark Fee Paid**
2. Applicant status: `ALLOCATED → CONFIRMED`

### 7. Dashboard (Management/Admin)
- Live metrics: total applicants, allocated, confirmed, fee-pending
- Quota fill percentage per program
- Fee-pending admission list

---

## API Overview

| Module | Base Path | Methods |
|--------|-----------|---------|
| Auth | `/api/auth` | Login, Me |
| Users | `/api/users` | CRUD (Admin only) |
| Institutions | `/api/masters/institutions` | CRUD |
| Campuses | `/api/masters/campuses` | CRUD |
| Departments | `/api/masters/departments` | CRUD |
| Programs | `/api/masters/programs` | CRUD |
| Academic Years | `/api/masters/academic-years` | CRUD |
| Course Types | `/api/masters/course-types` | CRUD |
| Entry Types | `/api/masters/entry-types` | CRUD |
| Admission Modes | `/api/masters/admission-modes` | CRUD |
| Seat Matrix | `/api/seat-matrix` | CRUD + seat availability |
| Applicants | `/api/applicants` | CRUD + documents + allocate |
| Admissions | `/api/admissions` | CRUD + mark fee paid |
| Dashboard | `/api/dashboard` | Stats |
| Health | `/api/health` | Health check |

---

## Database Schema

```
Institution
  └── Campus
        └── Department
              └── Program
                    └── SeatMatrix (per AcademicYear)
                          └── QuotaConfig (KCET / COMEDK / MANAGEMENT / NRI / SNQ)
                                └── Allocation
                                      └── Admission

Applicant
  ├── Documents (11 types)
  ├── Allocation (1:1)
  └── Admission (1:1)
```

---

## Environment Variables

### Root `.env` (Docker Compose)

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` | PostgreSQL username |
| `POSTGRES_PASSWORD` | PostgreSQL password |
| `POSTGRES_DB` | Database name |
| `POSTGRES_PORT` | Host port to expose (default: `5432`) |

### `backend/.env`

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | Full PostgreSQL connection string |
| `JWT_SECRET` | Strong secret for signing JWT tokens |
| `JWT_EXPIRES_IN` | Token expiry duration (e.g. `7d`) |
| `PORT` | Backend server port (default: `5000`) |
| `FRONTEND_URL` | Allowed CORS origin (default: `http://localhost:5173`) |

---

## Security Notes

- Never commit `.env` files — they are listed in `.gitignore`
- Use a strong, randomly generated `JWT_SECRET` in all environments
- Change all default passwords before deploying to any shared or production environment
- The `docker-compose.yml` reads credentials from the root `.env` file — keep it out of version control
