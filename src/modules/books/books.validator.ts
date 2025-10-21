import { z } from 'zod';

export const createBookSchema = z.object({
  title: z.string().min(1),
  author: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive(),
  stock: z.number().int().nonnegative().default(0),
  genreId: z.string().uuid(),
});

export const updateBookSchema = z.object({
  title: z.string().min(1).optional(),
  author: z.string().optional(),
  description: z.string().optional(),
  price: z.number().positive().optional(),
  stock: z.number().int().nonnegative().optional(), // can update stock
  genreId: z.string().uuid().optional(),
});

export const listQuerySchema = z.object({
  q: z.string().optional(),          // filter text
  genreId: z.string().uuid().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});
export type CreateBookDTO = z.infer<typeof createBookSchema>;
export type UpdateBookDTO = z.infer<typeof updateBookSchema>;
export type ListQueryDTO  = z.infer<typeof listQuerySchema>;
