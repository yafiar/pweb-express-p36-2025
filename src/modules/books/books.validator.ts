import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1),
  writer: z.string().min(1),
  publisher: z.string().min(1),
  publicationYear: z.number().int(),
  description: z.string().optional(),
  price: z.number().positive(),
  stockQuantity: z.number().int().nonnegative(),
  genreId: z.string().uuid(),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  writer: z.string().optional(),
  publisher: z.string().optional(),
  publicationYear: z.number().int().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stockQuantity: z.number().int().nonnegative().optional(),
  genreId: z.string().uuid().optional(),
});

export const listQuerySchema = z.object({
  q: z.string().optional(),
  genreId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

export type CreateBookDTO = z.infer<typeof createBookSchema>;
export type UpdateBookDTO = z.infer<typeof updateBookSchema>;
export type ListQueryDTO  = z.infer<typeof listQuerySchema>;
