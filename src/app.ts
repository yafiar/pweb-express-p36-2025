import express from 'express';
import cors from 'cors';
import { authRouter } from './modules/auth/auth.router';
import { booksRouter } from './modules/books/books.router';
import { genresRouter } from './modules/genres/genres.router';
import { transactionsRouter } from './modules/transactions/transactions.router';


const app = express();

app.use(cors());
app.use(express.json());

app.use('/auth', authRouter);

app.use('/books', booksRouter);

app.use('/genre', genresRouter);

app.use('/transactions', transactionsRouter);

// error handler sederhana
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Internal Server Error' });
});

export default app;
