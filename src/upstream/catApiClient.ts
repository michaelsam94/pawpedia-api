import { z } from 'zod';
import { AppError } from '../errors/app-error';
import { normalizeBreed, normalizeImage, upstreamBreedSchema, upstreamImageSchema } from '../model/breeds';
import type { AppEnv } from '../types/env';

const breedListSchema = z.array(upstreamBreedSchema);
const imageListSchema = z.array(upstreamImageSchema);

export function createCatApiClient(env: AppEnv['Bindings']) {
  const fetcher = env.CATAPI_FETCH ?? fetch;
  const baseUrl = env.CATAPI_BASE_URL.replace(/\/$/, '');
  const headers = new Headers({ accept: 'application/json' });

  if (env.CATAPI_API_KEY) {
    headers.set('x-api-key', env.CATAPI_API_KEY);
  }

  async function request(path: string) {
    const response = await fetcher(`${baseUrl}${path}`, {
      headers,
      signal: AbortSignal.timeout(5000)
    });

    if (response.status === 404) {
      throw new AppError(404, 'not_found', 'The requested cat resource was not found.');
    }

    if (!response.ok) {
      throw new AppError(502, 'upstream_unavailable', 'TheCatAPI is unavailable right now.');
    }

    return response.json();
  }

  return {
    async breeds() {
      const body = await request('/breeds');
      return breedListSchema.parse(body).map(normalizeBreed);
    },
    async breed(id: string) {
      const body = await request(`/breeds/${encodeURIComponent(id)}`);
      return normalizeBreed(upstreamBreedSchema.parse(body));
    },
    async search(query: string) {
      const body = await request(`/breeds/search?q=${encodeURIComponent(query)}`);
      return breedListSchema.parse(body).map(normalizeBreed);
    },
    async images(breedId: string, limit: number) {
      const body = await request(`/images/search?breed_id=${encodeURIComponent(breedId)}&limit=${limit}`);
      return imageListSchema.parse(body).map(normalizeImage);
    }
  };
}
