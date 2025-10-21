import { prisma } from '../../lib/db';
import { CreateGenreDTO, UpdateGenreDTO } from './genres.validator';

export async function createGenre(data: CreateGenreDTO) {
  return prisma.genre.create({
    data,
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
}

export async function listGenres() {
  return prisma.genre.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: 'desc' },
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
}

export async function getGenreById(id: string) {
  return prisma.genre.findFirst({
    where: { id, deletedAt: null },
    select: { id: true, name: true, createdAt: true, updatedAt: true, deletedAt: true },
  });
}

export async function updateGenre(id: string, data: UpdateGenreDTO) {
  return prisma.genre.update({
    where: { id },
    data,
    select: { id: true, name: true, createdAt: true, updatedAt: true },
  });
}

/** Soft delete: don't wipe books/history */
export async function deleteGenreSafe(id: string) {
  // Optional guard: prevent soft-deleting if active (non-deleted) books exist
  const hasBooks = await prisma.book.count({ where: { genreId: id, deletedAt: null } });
  if (hasBooks > 0) {
    // You can choose 409 or 400; 409 is common for conflict
    throw Object.assign(new Error('Genre has active books'), { code: 'GENRE_HAS_BOOKS' });
  }
  return prisma.genre.update({
    where: { id },
    data: { deletedAt: new Date() },
    select: { id: true, name: true, deletedAt: true },
  });
}
