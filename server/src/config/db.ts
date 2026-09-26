import { PrismaClient } from '@prisma/client';

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

/**
 * Execute query with automatic reconnect retry on closed serverless connections
 */
export async function withDbRetry<T>(queryFn: () => Promise<T>): Promise<T> {
  try {
    return await queryFn();
  } catch (error: any) {
    const isPoolError =
      error?.message?.includes('Closed') ||
      error?.message?.includes('connection pool') ||
      error?.message?.includes('Timed out') ||
      error?.code === 'P1001' ||
      error?.code === 'P1017' ||
      error?.code === 'P2024';

    if (isPoolError) {
      console.warn('[DB POOL RECONNECT] Database connection pool timed out or closed. Reconnecting & retrying query...');
      await prisma.$disconnect().catch(() => {});
      await prisma.$connect().catch(() => {});
      return await queryFn();
    }
    throw error;
  }
}
