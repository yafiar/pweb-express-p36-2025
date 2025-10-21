import { Request, Response } from 'express';
import { ZodError } from 'zod';
import { createGenreSchema, updateGenreSchema } from './genres.validator';
import { createGenre, listGenres, getGenreById, updateGenre, deleteGenreSafe } from './genres.service';

export async function createGenreHandler(req: Request, res: Response) {
  try {
    const data = createGenreSchema.parse(req.body);
    const genre = await createGenre(data);
    return res.status(201).json({ genre });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid body', errors: err.flatten() });
    if (err?.code === 'P2002') return res.status(409).json({ message: 'Genre name already exists' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function listGenresHandler(_req: Request, res: Response) {
  const items = await listGenres();
  return res.json({ items });
}

export async function getGenreDetailHandler(req: Request, res: Response) {
  const genre = await getGenreById(req.params.genre_id);
  if (!genre || genre.deletedAt) return res.status(404).json({ message: 'Genre not found' });
  return res.json({ genre });
}

export async function updateGenreHandler(req: Request, res: Response) {
  try {
    const data = updateGenreSchema.parse(req.body);
    const genre = await updateGenre(req.params.genre_id, data);
    return res.json({ genre });
  } catch (err: any) {
    if (err instanceof ZodError) return res.status(400).json({ message: 'Invalid body', errors: err.flatten() });
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Genre not found' });
    if (err?.code === 'P2002') return res.status(409).json({ message: 'Genre name already exists' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}

export async function deleteGenreHandler(req: Request, res: Response) {
  try {
    const genre = await deleteGenreSafe(req.params.genre_id);
    return res.json({ genre });
  } catch (err: any) {
    if (err?.code === 'GENRE_HAS_BOOKS') return res.status(409).json({ message: 'Cannot delete genre with active books' });
    if (err?.code === 'P2025') return res.status(404).json({ message: 'Genre not found' });
    return res.status(500).json({ message: 'Internal Server Error' });
  }
}
