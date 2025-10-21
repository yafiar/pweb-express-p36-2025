import { z } from 'zod';

export const createTransactionSchema = z.object({
  items: z.array(z.object({
    bookId: z.string().uuid(),
    quantity: z.number().int().min(1)
  })).min(1)
});
export type CreateTransactionDTO = z.infer<typeof createTransactionSchema>;
