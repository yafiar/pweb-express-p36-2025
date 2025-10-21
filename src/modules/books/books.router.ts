import { Router } from 'express';
import {
  createBookHandler, listBooksHandler, getBookDetailHandler,
  listBooksByGenreHandler, updateBookHandler, deleteBookHandler
} from './books.controller';

export const booksRouter = Router();

booksRouter.post('/', createBookHandler);
booksRouter.get('/', listBooksHandler);
booksRouter.get('/:book_id', getBookDetailHandler);
booksRouter.get('/genre/:genre_id', listBooksByGenreHandler);
booksRouter.patch('/:book_id', updateBookHandler);
booksRouter.delete('/:book_id', deleteBookHandler);
