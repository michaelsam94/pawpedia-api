import { Hono } from 'hono';
import { z } from 'zod';
import { AppError } from '../errors/app-error';
import { createCatApiClient } from '../upstream/catApiClient';
import type { AppEnv } from '../types/env';

const imageQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(10)
});

const searchQuerySchema = z.object({
  q: z.string().trim().min(1).max(100)
});

export const breedsRoutes = new Hono<AppEnv>();

breedsRoutes.get('/', async (c) => {
  const client = createCatApiClient(c.env);
  return c.json(await client.breeds());
});

breedsRoutes.get('/search', async (c) => {
  const parsed = searchQuerySchema.safeParse({ q: c.req.query('q') });
  if (!parsed.success) {
    throw new AppError(422, 'validation_error', 'Search query must be 1-100 characters.', parsed.error.flatten());
  }

  const client = createCatApiClient(c.env);
  return c.json(await client.search(parsed.data.q));
});

breedsRoutes.get('/:breedId/images', async (c) => {
  const parsed = imageQuerySchema.safeParse({ limit: c.req.query('limit') });
  if (!parsed.success) {
    throw new AppError(422, 'validation_error', 'Image limit must be between 1 and 100.', parsed.error.flatten());
  }

  const client = createCatApiClient(c.env);
  return c.json(await client.images(c.req.param('breedId'), parsed.data.limit));
});

breedsRoutes.get('/:breedId', async (c) => {
  const client = createCatApiClient(c.env);
  return c.json(await client.breed(c.req.param('breedId')));
});
