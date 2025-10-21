import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { booksRouter } from './modules/books/books.router';
import { genresRouter } from './modules/genres/genres.router';
import { transactionsRouter } from './modules/transactions/transactions.router';

const app = express();

app.use(cors());
app.use(express.json());

// optional root
app.get('/', (_req, res) => res.json({ name: 'IT Literature Shop API', status: 'ok' }));

app.use('/auth', authRouter);
app.use('/books', booksRouter);
app.use('/genre', genresRouter);
app.use('/transactions', transactionsRouter);

// 404
app.use((_req, res) => res.status(404).json({ message: 'Route not found' }));
// error
app.use((err: any, _req: any, res: any, _next: any) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
