export type FavoriteInput = {
  breedId: string;
  breedName: string;
  imageUrl?: string | null;
};

export type FavoriteRecord = {
  id: string;
  deviceId: string;
  breedId: string;
  breedName: string;
  imageUrl: string | null;
  createdAt: string;
};

export async function listFavorites(db: D1Database, deviceId: string) {
  const result = await db
    .prepare('SELECT id, deviceId, breedId, breedName, imageUrl, createdAt FROM Favorite WHERE deviceId = ? ORDER BY createdAt DESC')
    .bind(deviceId)
    .all<FavoriteRecord>();

  return result.results ?? [];
}

export async function addFavorite(db: D1Database, deviceId: string, input: FavoriteInput) {
  const existing = await db
    .prepare('SELECT id, deviceId, breedId, breedName, imageUrl, createdAt FROM Favorite WHERE deviceId = ? AND breedId = ?')
    .bind(deviceId, input.breedId)
    .first<FavoriteRecord>();

  if (existing) {
    return existing;
  }

  const favorite = {
    id: crypto.randomUUID(),
    deviceId,
    breedId: input.breedId,
    breedName: input.breedName,
    imageUrl: input.imageUrl ?? null,
    createdAt: new Date().toISOString()
  };

  await db
    .prepare('INSERT INTO Favorite (id, deviceId, breedId, breedName, imageUrl, createdAt) VALUES (?, ?, ?, ?, ?, ?)')
    .bind(favorite.id, favorite.deviceId, favorite.breedId, favorite.breedName, favorite.imageUrl, favorite.createdAt)
    .run();

  return favorite;
}

export async function deleteFavorite(db: D1Database, deviceId: string, breedId: string) {
  await db
    .prepare('DELETE FROM Favorite WHERE deviceId = ? AND breedId = ?')
    .bind(deviceId, breedId)
    .run();
}
