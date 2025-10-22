import express from 'express';
import cors from 'cors';

import { authRouter } from './modules/auth/auth.router';
import { booksRouter } from './modules/books/books.router';
import { genresRouter } from './modules/genres/genres.router';
import { transactionsRouter } from './modules/transactions/transactions.router';

const app = express();

app.use(cors());
app.use(express.json());

// Health/root
app.get('/', (_req, res) =>
  res.json({ name: 'IT Literature Shop API', status: 'ok' })
);

// Route mounts
app.use('/auth', authRouter);
app.use('/books', booksRouter);
// Note: keep this path as '/genre' to match your routers & docs.
app.use('/genre', genresRouter);
app.use('/transactions', transactionsRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
