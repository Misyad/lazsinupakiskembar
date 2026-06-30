/**
 * Tile Cache — stores map tiles in IndexedDB for offline use.
 * After rewrite: validates content-type, logs every request, checks zoom limits.
 */

const DB_NAME = "hermes-tile-cache";
const DB_VERSION = 1;
const STORE_NAME = "tiles";
const MAX_TILES = 5000;

/** ESRI World Imagery max reliable zoom in Indonesia (18=~1m/px, 19 is spotty) */
export const ESRI_MAX_ZOOM = 18;

const LOG_PREFIX = "[TileCache]";

function log(...args: unknown[]) {
  if (typeof window !== "undefined" && (location.hostname === "localhost" || location.search.includes("debug=tile"))) {
    console.debug(LOG_PREFIX, ...args);
  }
}

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
  const cacheKey = cacheKeyFor(url);
  log("GET", cacheKey);
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(cacheKey);
      req.onsuccess = () => {
        if (req.result) {
          const blob = req.result.data;
          log("HIT — blob size:", blob.size, "type:", blob.type);
          resolve(URL.createObjectURL(blob));
        } else {
          log("MISS");
          resolve(null);
        }
      };
      req.onerror = () => {
        log("GET error");
        resolve(null);
      };
    });
  } catch (e) {
    log("GET exception:", e);
    return null;
  }
}

export async function saveTile(
  url: string,
  blob: Blob,
  context: "tileload" | "precache" | "precache-skip" = "tileload"
): Promise<void> {
  const cacheKey = cacheKeyFor(url);

  // ── Guard: only store real image blobs ───────────────────────────
  if (!blob.type.startsWith("image/")) {
    log("SKIP — not an image. type:", blob.type, "size:", blob.size, "context:", context, "key:", cacheKey);
    return;
  }

  // ── Guard: reject very small blobs (ESRI error pages are ~1-5 KB HTML) ──
  if (blob.size < 500) {
    log("SKIP — blob too small (likely error page). size:", blob.size, "key:", cacheKey);
    return;
  }

  log("SAVE — size:", blob.size, "type:", blob.type, "context:", context, "key:", cacheKey);

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    // Evict oldest if over limit
    const countReq = store.count();
    countReq.onsuccess = () => {
      if (countReq.result >= MAX_TILES) {
        const index = store.index("timestamp");
        const cursor = index.openCursor(IDBKeyRange.lowerBound(0));
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

    store.put({ key: cacheKey, data: blob, timestamp: Date.now() });
  } catch (e) {
    log("SAVE exception:", e);
  }
}

export async function preCacheArea(
  centerLat: number,
  centerLng: number,
  minZoom: number,
  maxZoom: number
): Promise<number> {
  // Clamp zoom to reliable range
  const actualMax = Math.min(maxZoom, ESRI_MAX_ZOOM);
  log(`preCacheArea — lat:${centerLat} lng:${centerLng} zoom:${minZoom}-${actualMax}`);

  let cached = 0;
  for (let z = minZoom; z <= actualMax; z++) {
    const c = latLngToTile(centerLat, centerLng, z);
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const x = c.x + dx;
        const y = c.y + dy;
        const urls = [
          `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${z}/${y}/${x}`,
          `https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/${z}/${y}/${x}`,
        ];
        for (const url of urls) {
          try {
            const existing = await getTile(url);
            if (!existing) {
              const res = await fetch(url, { mode: "cors" });
              if (!res.ok) {
                log(`preCache NET ERROR — ${res.status} ${res.statusText}`, url.substring(0, 80));
                continue;
              }
              const contentType = res.headers.get("content-type") || "";
              if (!contentType.startsWith("image/")) {
                log(`preCache SKIP — not image (${contentType})`, url.substring(0, 80));
                continue;
              }
              const blob = await res.blob();
              if (blob.size < 500) {
                log(`preCache SKIP — too small (${blob.size} bytes)`, url.substring(0, 80));
                continue;
              }
              await saveTile(url, blob, "precache");
              cached++;
            }
          } catch (e) {
            log("preCache FETCH exception:", e, url.substring(0, 80));
          }
        }
      }
    }
  }
  log(`preCacheArea done — ${cached} new tiles cached`);
  return cached;
}

export async function getCacheInfo(): Promise<{ count: number; sizeMB: number }> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const count = await new Promise<number>((resolve) => {
      const req = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => resolve(0);
    });
    return { count, sizeMB: Math.round((count * 50) / 1024) }; // ~50KB/tile avg
  } catch {
    return { count: 0, sizeMB: 0 };
  }
}

function cacheKeyFor(url: string): string {
  // Normalise: strip query params, keep full URL as-is (includes layer, z, y, x)
  return url.split("?")[0];
}

function latLngToTile(lat: number, lng: number, zoom: number) {
  const n = Math.pow(2, zoom);
  const x = Math.floor(((lng + 180) / 360) * n);
  const latRad = (lat * Math.PI) / 180;
  const y = Math.floor((1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n);
  return { x, y };
}
