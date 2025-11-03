import { Router } from 'express';
import {
  createBookHandler, listBooksHandler, getBookDetailHandler,
  listBooksByGenreHandler, updateBookHandler, deleteBookHandler
} from './books.controller';
import { requireAuth } from '../../middleware/auth'; 

export const booksRouter = Router();

booksRouter.post('/', createBookHandler);
booksRouter.get('/', listBooksHandler);
booksRouter.get('/genre/:genre_id', listBooksByGenreHandler);
booksRouter.get('/:book_id', getBookDetailHandler);
booksRouter.patch('/:book_id', updateBookHandler);
booksRouter.delete('/:book_id', deleteBookHandler);

booksRouter.patch('/:book_id', requireAuth, updateBookHandler);  
booksRouter.delete('/:book_id', requireAuth, deleteBookHandler); 
