import { prisma } from '../../lib/db';
import { Prisma } from '@prisma/client';
import { CreateBookDTO, UpdateBookDTO, ListQueryDTO } from './books.validator';

export async function createBook(data: CreateBookDTO) {
  return prisma.book.create({ data });
}

export async function getBookById(id: string) {
  return prisma.book.findFirst({
    where: { id, deletedAt: null },
    include: { genre: true },
  });
}

export async function listBooks(query: ListQueryDTO) {
  const { q, genreId, page, limit } = query;

  const where: Prisma.BookWhereInput = {
    deletedAt: null,
    AND: [
      genreId ? { genreId } : {},
      q
        ? {
            OR: [
              { title:     { contains: q, mode: 'insensitive' } },
              { writer:    { contains: q, mode: 'insensitive' } },
              { publisher: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {},
    ],
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where, include: { genre: true }, orderBy: { createdAt: 'desc' },
      take: limit, skip: (page - 1) * limit
    }),
    prisma.book.count({ where })
  ]);

  return { items, page, limit, total, totalPages: Math.ceil(total / limit) };
}

export async function listBooksByGenre(genreId: string, query: ListQueryDTO) {
  return listBooks({ ...query, genreId });
}

export async function updateBook(id: string, data: UpdateBookDTO) {
  return prisma.book.update({
    where: { id },
    data,
    select: {
      id: true,
      title: true,
      writer: true,
      publisher: true,
      publicationYear: true,
      price: true,
      stockQuantity: true,
      genreId: true,
      updatedAt: true,
    },
  });
}

export async function deleteBookSafe(id: string) {

  return prisma.book.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, title: true, deletedAt: true },
  });
}
