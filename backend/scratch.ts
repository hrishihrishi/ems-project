import { PrismaClient } from '@prisma/client';
console.log('Available options for PrismaClient:', Object.keys(PrismaClient));
try {
  const prisma = new PrismaClient({ url: process.env.DATABASE_URL } as any);
  console.log('Success with url option');
} catch (e: any) {
  console.error(e.message);
}
