/**
 * Reverse Geocoding — converts lat/lng to address using Nominatim (OpenStreetMap).
 * Same service as SearchAddress for consistency.
 */

export type ReverseGeoResult = {
  address: string;
  hamlet: string | null;
  village: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;
};

const REVERSE_URL = "https://nominatim.openstreetmap.org/reverse";

let lastRequest = 0;
const MIN_INTERVAL = 1100; // Nominatim: max 1 req/sec

export async function reverseGeocode(lat: number, lng: number): Promise<ReverseGeoResult | null> {
  // Rate limit: ensure at least 1.1s between requests
  const now = Date.now();
  const wait = Math.max(0, MIN_INTERVAL - (now - lastRequest));
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));

  try {
    const url = `${REVERSE_URL}?format=json&lat=${lat}&lon=${lng}&addressdetails=1&zoom=18`;
    const res = await fetch(url, {
      headers: { "Accept-Language": "id", "User-Agent": "KOINNU-RantingSystem/2.3" },
    });

    lastRequest = Date.now();

    if (!res.ok) return null;

    const data = await res.json();

    if (!data || data.error) return null;

    const addr = data.address || {};
    const display = data.display_name || "";

    // Build a clean short address
    const parts = [addr.road, addr.hamlet || addr.village || addr.suburb, addr.city || addr.town, addr.state].filter(Boolean);
    const shortAddress = parts.join(", ") || display.split(",").slice(0, 3).join(",");

    return {
      address: shortAddress,
      hamlet: addr.hamlet || null,
      village: addr.village || addr.suburb || null,
      district: addr.district || null,
      city: addr.city || addr.town || null,
      state: addr.state || null,
      postcode: addr.postcode || null,
    };
  } catch {
    return null;
  }
}
