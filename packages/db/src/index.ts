import { PrismaClient } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

let prismaInstance: PrismaClient;

try {
  prismaInstance =
    global.prisma ??
    new PrismaClient({
      log: process.env.NODE_ENV === 'production' ? ['error'] : ['error', 'warn'],
    });

  if (process.env.NODE_ENV !== 'production') {
    global.prisma = prismaInstance;
  }
} catch (error) {
  console.error('Failed to initialize Prisma Client:', error);
  throw error;
}

export const prisma = prismaInstance;


