import { Router } from 'express';
import {
  createBookHandler, listBooksHandler, getBookDetailHandler,
  listBooksByGenreHandler, updateBookHandler, deleteBookHandler
} from './books.controller';
// If you want some routes protected, add requireAuth
// import { requireAuth } from '../../middleware/auth';

export const booksRouter = Router();

booksRouter.post('/', /* requireAuth, */ createBookHandler);
booksRouter.get('/', listBooksHandler);
booksRouter.get('/:book_id', getBookDetailHandler);
booksRouter.get('/genre/:genre_id', listBooksByGenreHandler);
booksRouter.patch('/:book_id', /* requireAuth, */ updateBookHandler);
booksRouter.delete('/:book_id', /* requireAuth, */ deleteBookHandler);
