import { Router } from 'express';
import { createGenreHandler, listGenresHandler, getGenreDetailHandler, updateGenreHandler, deleteGenreHandler } from './genres.controller';
import { requireAuth } from '../../middleware/auth'; 

export const genresRouter = Router();

genresRouter.post('/', createGenreHandler);
genresRouter.get('/', listGenresHandler);
genresRouter.get('/:genre_id', getGenreDetailHandler);
genresRouter.patch('/:genre_id', updateGenreHandler);
genresRouter.delete('/:genre_id', deleteGenreHandler);

genresRouter.patch('/:genre_id', requireAuth, updateGenreHandler); 
genresRouter.delete('/:genre_id', requireAuth, deleteGenreHandler);

