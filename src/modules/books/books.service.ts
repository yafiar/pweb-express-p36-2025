import { prisma } from '../../lib/db';
import { CreateBookDTO, UpdateBookDTO, ListQueryDTO } from './books.validator';
import { Prisma } from '@prisma/client';

export async function createBook(data: CreateBookDTO) {
  return prisma.book.create({ data });
}

export async function getBookById(id: string) {
  return prisma.book.findFirst({
    where: { id, isDeleted: false },
    include: { genre: true },
  });
}

export async function listBooks(query: ListQueryDTO) {
  const { q, genreId, page, limit } = query;
  const { take, skip } = { take: query.limit, skip: (query.page - 1) * query.limit };

  const where: Prisma.BookWhereInput = {
    isDeleted: false,
    AND: [
      genreId ? { genreId } : {},
      q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { author: { contains: q, mode: 'insensitive' } },
              { description: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { genre: true },
      take,
      skip,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
}

export async function listBooksByGenre(genreId: string, query: ListQueryDTO) {
  return listBooks({ ...query, genreId });
}

export async function updateBook(id: string, data: UpdateBookDTO) {
  return prisma.book.update({
    where: { id },
    data,
    select: { id: true, title: true, author: true, description: true, price: true, stock: true, genreId: true, updatedAt: true },
  });
}

// "Safe delete": don't actually remove rows to preserve transaction history
export async function deleteBookSafe(id: string) {
  return prisma.book.update({
    where: { id },
    data: { isDeleted: true },
    select: { id: true, title: true, isDeleted: true },
  });
}
