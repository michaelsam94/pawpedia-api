import type { AppEnv } from '../src/types/env';

type StoredFavorite = {
  id: string;
  deviceId: string;
  breedId: string;
  breedName: string;
  imageUrl: string | null;
  createdAt: string;
};

export function createMockDb(): D1Database {
  const favorites: StoredFavorite[] = [];

  const db = {
    prepare(query: string) {
      const statement = {
        bind(...values: unknown[]) {
          return {
            async all() {
              if (query.includes('SELECT') && query.includes('FROM Favorite')) {
                const deviceId = String(values[0]);
                return {
                  success: true,
                  results: favorites
                    .filter((favorite) => favorite.deviceId === deviceId)
                    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
                };
              }

              return { success: true, results: [] };
            },
            async first() {
              if (query.includes('SELECT') && query.includes('FROM Favorite')) {
                const deviceId = String(values[0]);
                const breedId = String(values[1]);
                return favorites.find((favorite) => favorite.deviceId === deviceId && favorite.breedId === breedId) ?? null;
              }

              return null;
            },
            async run() {
              if (query.includes('INSERT')) {
                const id = String(values[0]);
                const deviceId = String(values[1]);
                const breedId = String(values[2]);
                const breedName = String(values[3]);
                const imageUrl = values[4] === null ? null : String(values[4]);
                const createdAt = String(values[5]);
                const exists = favorites.some((favorite) => favorite.deviceId === deviceId && favorite.breedId === breedId);
                if (!exists) {
                  favorites.push({
                    id,
                    deviceId,
                    breedId,
                    breedName,
                    imageUrl,
                    createdAt
                  });
                }
              }

              if (query.includes('DELETE')) {
                const deviceId = String(values[0]);
                const breedId = String(values[1]);
                const index = favorites.findIndex((favorite) => favorite.deviceId === deviceId && favorite.breedId === breedId);
                if (index >= 0) {
                  favorites.splice(index, 1);
                }
              }

              return { success: true, meta: { changes: 1 } };
            }
          };
        }
      };

      return statement;
    }
  };

  return db as unknown as D1Database;
}

export function createEnv(overrides: Partial<AppEnv['Bindings']> = {}): AppEnv['Bindings'] {
  return {
    DB: createMockDb(),
    CATAPI_API_KEY: 'test-key',
    CATAPI_BASE_URL: 'https://cat-api.test/v1',
    ALLOWED_ORIGIN: 'http://localhost:5173',
    ...overrides
  };
}
