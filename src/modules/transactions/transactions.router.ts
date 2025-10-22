import { Router } from 'express';
import {
  createTransactionHandler,
  listTransactionsHandler,
  getTransactionDetailHandler,
  getStatisticsHandler
} from './transactions.controller';
import { requireAuth } from '../../middleware/auth';

export const transactionsRouter = Router();

transactionsRouter.post('/', requireAuth, createTransactionHandler);
transactionsRouter.get('/', listTransactionsHandler);
transactionsRouter.get('/statistics', getStatisticsHandler);
transactionsRouter.get('/:transaction_id', getTransactionDetailHandler);
