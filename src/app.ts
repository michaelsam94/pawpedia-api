import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { secureHeaders } from 'hono/secure-headers';
import type { ContentfulStatusCode } from 'hono/utils/http-status';
import { AppError, errorBody } from './errors/app-error';
import { breedsRoutes } from './routes/breeds';
import { favoritesRoutes } from './routes/favorites';
import type { AppEnv } from './types/env';

export const app = new Hono<AppEnv>();

app.use('*', async (c, next) => {
  const corsMiddleware = cors({
    origin: c.env.ALLOWED_ORIGIN,
    allowHeaders: ['Content-Type', 'X-Device-Id'],
    allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS']
  });
  return corsMiddleware(c, next);
});

app.use('*', secureHeaders());

app.get('/health', (c) => c.json({ ok: true, service: 'pawpedia-api' }));

app.route('/api/breeds', breedsRoutes);
app.route('/api/favorites', favoritesRoutes);

app.notFound((c) => c.json(errorBody(new AppError(404, 'not_found', 'Route not found.')), 404));

app.onError((error, c) => {
  if (error instanceof AppError) {
    return c.json(errorBody(error), error.status as ContentfulStatusCode);
  }

  if (error instanceof Error && error.name === 'ZodError') {
    return c.json(errorBody(new AppError(502, 'upstream_unavailable', 'TheCatAPI returned an unexpected response.')), 502);
  }

  console.error(error);
  return c.json(errorBody(new AppError(500, 'internal_error', 'Unexpected server error.')), 500);
});
