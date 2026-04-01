import dotenv from 'dotenv';
dotenv.config();

export const env = {
  DATABASE_URL: process.env['DATABASE_URL'] ?? '',
  JWT_SECRET: process.env['JWT_SECRET'] ?? '',
  JWT_EXPIRES_IN: process.env['JWT_EXPIRES_IN'] ?? '7d',
  PORT: parseInt(process.env['PORT'] ?? '5000', 10),
  FRONTEND_URL: process.env['FRONTEND_URL'] ?? 'http://localhost:5173',
};
