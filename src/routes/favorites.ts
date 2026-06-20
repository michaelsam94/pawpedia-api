import { Hono } from 'hono';
import { z } from 'zod';
import { AppError } from '../errors/app-error';
import { addFavorite, deleteFavorite, listFavorites } from '../db/favorites';
import type { AppEnv } from '../types/env';

const favoriteInputSchema = z.object({
  breedId: z.string().trim().min(1).max(64),
  breedName: z.string().trim().min(1).max(160),
  imageUrl: z.string().url().optional().nullable()
});

export const favoritesRoutes = new Hono<AppEnv>();

favoritesRoutes.use('*', async (c, next) => {
  const deviceId = c.req.header('x-device-id')?.trim();
  if (!deviceId) {
    throw new AppError(401, 'unauthorized', 'X-Device-Id header is required for favorites.');
  }

  c.set('deviceId', deviceId);
  await next();
});

favoritesRoutes.get('/', async (c) => {
  return c.json(await listFavorites(c.env.DB, c.get('deviceId')));
});

favoritesRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = favoriteInputSchema.safeParse(body);
  if (!parsed.success) {
    throw new AppError(422, 'validation_error', 'Favorite payload is invalid.', parsed.error.flatten());
  }

  const favorite = await addFavorite(c.env.DB, c.get('deviceId'), parsed.data);
  return c.json(favorite, 201);
});

favoritesRoutes.delete('/:breedId', async (c) => {
  await deleteFavorite(c.env.DB, c.get('deviceId'), c.req.param('breedId'));
  return c.body(null, 204);
});
