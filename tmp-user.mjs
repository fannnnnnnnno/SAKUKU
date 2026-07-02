import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

try {
  const users = await prisma.user.findMany({ select: { id: true, email: true, name: true, password: true } });
  console.log(JSON.stringify(users, null, 2));
} catch (error) {
  console.error(error);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
