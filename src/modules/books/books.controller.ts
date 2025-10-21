import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createBookSchema, updateBookSchema, listQuerySchema } from './books.validator';
import { createBook, getBookById, listBooks, listBooksByGenre, updateBook, deleteBookSafe } from './books.service';

export async function createBookHandler(req: Request, res: Response) {
  try {
    const data = createBookSchema.parse(req.body);
    const book = await createBook(data);
    return res.status(201).json({ book });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid body', errors: err.flatten() });
    if (err?.code === 'P2002') return res.status(409).json({ message: 'Book title already exists' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function listBooksHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await listBooks(query);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid query', errors: err.flatten() });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function getBookDetailHandler(req: Request, res: Response) {
  const book = await getBookById(req.params.book_id);
  if (!book) return res.status(404).json({ message: 'Book not found' });
  return res.json({ book });
}

export async function listBooksByGenreHandler(req: Request, res: Response) {
  try {
    const query = listQuerySchema.parse(req.query);
    const result = await listBooksByGenre(req.params.genre_id, query);
    return res.json(result);
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid query', errors: err.flatten() });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function updateBookHandler(req: Request, res: Response) {
  try {
    const data = updateBookSchema.parse(req.body);
    const updated = await updateBook(req.params.book_id, data);
    return res.json({ book: updated });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid body', errors: err.flatten() });
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Book not found' });
    if (err?.code === 'P2002') return res.status(409).json({ message: 'Book title already exists' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function deleteBookHandler(req: Request, res: Response) {
  try {
    const deleted = await deleteBookSafe(req.params.book_id);
    return res.json({ book: deleted });
  } catch (err: any) {
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Book not found' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
