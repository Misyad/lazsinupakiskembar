/**
 * Tile Cache — stores map tiles in IndexedDB for offline use.
 * No external dependencies, uses native IndexedDB API.
 */

const DB_NAME = "hermes-tile-cache";
const DB_VERSION = 1;
const STORE_NAME = "tiles";
const MAX_TILES = 5000;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "key" });
        store.createIndex("timestamp", "timestamp", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getTile(url: string): Promise<string | null> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(url);
      req.onsuccess = () => {
        if (req.result) {
          const blob = req.result.data;
          resolve(URL.createObjectURL(blob));
        } else {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function saveTile(url: string, blob: Blob): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Check total tiles, remove oldest if over limit
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result >= MAX_TILES) {
        // Remove oldest 500 tiles
        const index = store.index("timestamp");
        const range = IDBKeyRange.lowerBound(0);
        const cursor = index.openCursor(range);
        let deleted = 0;
        cursor.onsuccess = () => {
          if (cursor.result && deleted < 500) {
            store.delete(cursor.result.primaryKey);
            cursor.result.continue();
            deleted++;
          }
        };
      }
    };

    store.put({ key: url, data: blob, timestamp: Date.now() });
  } catch {
    // Silently fail — tile will load from network
  }
}

export async function preCacheArea(
  centerLat: number,
  centerLng: number,
  minZoom: number,
  maxZoom: number
): Promise<number> {
  // Calculate tile coordinates for the area
  function latLngToTile(lat: number, lng: number, zoom: number) {
    const n = Math.pow(2, zoom);
    const x = Math.floor(((lng + 180) / 360) * n);
    const latRad = (lat * Math.PI) / 180;
    const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
    return { x, y };
  }

  let cached = 0;
  for (let z = minZoom; z <= maxZoom; z++) {
    const center = latLngToTile(centerLat, centerLng, z);
    // 3x3 grid around center
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = center.x + dx;
        const y = center.y + dy;
        const urls = [
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
          `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`,
        ];
        for (const url of urls) {
          try {
            const existing = await getTile(url);
            if (!existing) {
              const res = await fetch(url, { mode: "cors" });
              if (res.ok) {
                const blob = await res.blob();
                await saveTile(url, blob);
                cached++;
              }
            }
          } catch {
            // Skip failed tiles
          }
        }
      }
    }
  }
  return cached;
}

export async function getCacheInfo(): Promise<{ count: number; size: number }> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const count = await new Promise<number>((resolve) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
    return { count, size: count * 50 }; // ~50KB per tile average
  } catch {
    return { count: 0, size: 0 };
  }
}
