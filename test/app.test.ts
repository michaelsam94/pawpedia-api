import { describe, expect, it, vi } from 'vitest';
import { app } from '../src/app';
import { createEnv } from './helpers';

const breed = {
  id: 'abys',
  name: 'Abyssinian',
  temperament: 'Active, Energetic, Independent',
  origin: 'Egypt',
  description: 'The Abyssinian is easy to care for.',
  life_span: '14 - 15',
  wikipedia_url: 'https://en.wikipedia.org/wiki/Abyssinian_cat',
  weight: { imperial: '7 - 10', metric: '3 - 5' },
  affection_level: 5,
  child_friendly: 3,
  dog_friendly: 4,
  energy_level: 5,
  grooming: 1,
  health_issues: 2,
  intelligence: 5,
  shedding_level: 2,
  social_needs: 5,
  stranger_friendly: 5,
  vocalisation: 1
};

describe('PawPedia API', () => {
  it('returns health status', async () => {
    const response = await app.request('/health', {}, createEnv());

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, service: 'pawpedia-api' });
  });

  it('proxies and normalizes the breed catalog', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify([breed]), { status: 200 }));
    const response = await app.request('/api/breeds', {}, createEnv({ CATAPI_FETCH: fetchMock }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject([
      {
        id: 'abys',
        name: 'Abyssinian',
        origin: 'Egypt',
        temperament: ['Active', 'Energetic', 'Independent'],
        weight: { imperial: '7 - 10', metric: '3 - 5' },
        ratings: { affection: 5, energy: 5 }
      }
    ]);
    expect(fetchMock).toHaveBeenCalledWith('https://cat-api.test/v1/breeds', expect.any(Object));
    const [, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(new Headers(init.headers).get('x-api-key')).toBe('test-key');
  });

  it('returns validation errors for invalid image limits', async () => {
    const response = await app.request('/api/breeds/abys/images?limit=101', {}, createEnv());

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'validation_error' }
    });
  });

  it('requires a device id for favorites', async () => {
    const response = await app.request('/api/favorites', {}, createEnv());

    expect(response.status).toBe(401);
    await expect(response.json()).resolves.toMatchObject({
      error: { code: 'unauthorized' }
    });
  });

  it('creates, lists, and deletes favorites for an anonymous device', async () => {
    const env = createEnv();
    const headers = {
      'content-type': 'application/json',
      'x-device-id': 'device-123'
    };

    const createResponse = await app.request('/api/favorites', {
      method: 'POST',
      headers,
      body: JSON.stringify({
        breedId: 'abys',
        breedName: 'Abyssinian',
        imageUrl: 'https://cdn.example/abys.jpg'
      })
    }, env);

    expect(createResponse.status).toBe(201);

    const listResponse = await app.request('/api/favorites', { headers }, env);
    expect(listResponse.status).toBe(200);
    await expect(listResponse.json()).resolves.toMatchObject([
      {
        breedId: 'abys',
        breedName: 'Abyssinian',
        imageUrl: 'https://cdn.example/abys.jpg'
      }
    ]);

    const deleteResponse = await app.request('/api/favorites/abys', { method: 'DELETE', headers }, env);
    expect(deleteResponse.status).toBe(204);

    const afterDeleteResponse = await app.request('/api/favorites', { headers }, env);
    await expect(afterDeleteResponse.json()).resolves.toEqual([]);
  });
});
