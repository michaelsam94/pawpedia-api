CREATE TABLE IF NOT EXISTS Favorite (
  id TEXT PRIMARY KEY NOT NULL,
  deviceId TEXT NOT NULL,
  breedId TEXT NOT NULL,
  breedName TEXT NOT NULL,
  imageUrl TEXT,
  createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS Favorite_deviceId_breedId_key
  ON Favorite (deviceId, breedId);

CREATE INDEX IF NOT EXISTS Favorite_deviceId_idx
  ON Favorite (deviceId);
