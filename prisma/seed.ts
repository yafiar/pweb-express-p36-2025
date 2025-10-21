import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
  create: { email: 'demo@example.com', name: 'Demo User', password: passwordHash },
  });

  const gProgramming = await prisma.genre.upsert({
    where: { name: 'Programming' },
    update: {},
    create: { name: 'Programming' },
  });

  const gDesign = await prisma.genre.upsert({
    where: { name: 'Design' },
    update: {},
    create: { name: 'Design' },
  });

  await prisma.book.createMany({
    data: [
      {
        title: 'Clean Code',
        author: 'Robert C. Martin',
        price: 200000,
        stock: 10,
        genreId: gProgramming.id,
      },
      {
        title: 'Refactoring',
        author: 'Martin Fowler',
        price: 250000,
        stock: 7,
        genreId: gProgramming.id,
      },
      {
        title: 'Design of Everyday Things',
        author: 'Don Norman',
        price: 150000,
        stock: 5,
        genreId: gDesign.id,
      }
    ],
    skipDuplicates: true
  });

  console.log('Seed ok:', { user: user.email, genres: [gProgramming.name, gDesign.name] });
}

main().finally(async () => { await prisma.$disconnect(); });
