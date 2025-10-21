import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createTransactionSchema } from './transactions.validator';
import { createTransaction, listTransactions, getTransactionById, getStatistics } from './transactions.service';

export async function createTransactionHandler(req: Request, res: Response) {
  try {
    // If you protect with auth middleware, get userId from req.user.sub; else accept from body (not recommended).
    const userId = (req as any).user?.sub || req.body.userId;
    if (!userId) return res.status(401).json({ message: 'Unauthorized' });

    const dto = createTransactionSchema.parse(req.body);
    const order = await createTransaction(userId, dto);
    return res.status(201).json({ order });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid body', errors: err.flatten() });
    if (err?.code === 'BOOK_NOT_FOUND') return res.status(404).json({ message: 'One or more books not found' });
    if (err?.code === 'INSUFFICIENT_STOCK') return res.status(409).json({ message: err.message });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function listTransactionsHandler(req: Request, res: Response) {
  const page = Number(req.query.page || 1);
  const limit = Math.min(100, Number(req.query.limit || 10));
  const data = await listTransactions(page, limit);
  return res.json(data);
}

export async function getTransactionDetailHandler(req: Request, res: Response) {
  const order = await getTransactionById(req.params.transaction_id);
  if (!order) return res.status(404).json({ message: 'Transaction not found' });
  return res.json({ order });
}

export async function getStatisticsHandler(_req: Request, res: Response) {
  const stats = await getStatistics();
  return res.json(stats);
}
