import { KEDIRI_DEFAULT_COORDS } from '../smartCityStorage';

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  label: string;
  method: 'gps' | 'ip' | 'default';
  city?: string;
}

/**
 * Robust, resilient location detection for browser, desktop, and localhost environments.
 * 1. Attempts standard browser geolocation.
 * 2. If blocked by macOS/browser permissions or timeout, automatically falls back to IP Geolocation.
 * 3. Never throws a blocking error to the user.
 */
export async function detectSmartCityLocation(): Promise<DetectedLocationResult> {
  // Step 1: Try browser geolocation with standard accuracy (avoids GPS hardware freeze on laptops)
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: false,
          timeout: 4500,
          maximumAge: 300000
        });
      });

      const lat = Math.round(pos.coords.latitude * 10000) / 10000;
      const lng = Math.round(pos.coords.longitude * 10000) / 10000;

      return {
        lat,
        lng,
        label: 'GPS Perangkat Terdeteksi',
        method: 'gps'
      };
    } catch (browserErr) {
      console.warn('Browser GPS permission/timeout, falling back to IP Geolocation:', browserErr);
    }
  }

  // Step 2: Fallback to fast, free IP Geolocation (via geojs.io)
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 4000);

    const res = await fetch('https://get.geojs.io/v1/ip/geo.json', {
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (data && data.latitude && data.longitude) {
        const lat = Math.round(parseFloat(data.latitude) * 10000) / 10000;
        const lng = Math.round(parseFloat(data.longitude) * 10000) / 10000;
        const cityName = data.city || data.region || 'Wilayah Anda';

        return {
          lat,
          lng,
          label: `Lokasi Jaringan (${cityName})`,
          city: cityName,
          method: 'ip'
        };
      }
    }
  } catch (ipErr) {
    console.warn('IP Geolocation unavailable, falling back to default city center:', ipErr);
  }

  // Step 3: Graceful fallback to Kediri Center
  return {
    lat: KEDIRI_DEFAULT_COORDS.lat,
    lng: KEDIRI_DEFAULT_COORDS.lng,
    label: 'Balai Kota / Pusat Kediri',
    city: 'Kediri',
    method: 'default'
  };
}

/**
 * Geocode any custom city or street name in Indonesia using OpenStreetMap Nominatim.
 */
export async function geocodeAddressQuery(
  query: string
): Promise<{ lat: number; lng: number; displayName: string } | null> {
  const clean = query.trim();
  if (!clean) return null;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);

    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      clean + ', Indonesia'
    )}&limit=1`;

    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0 && data[0].lat && data[0].lon) {
        return {
          lat: Math.round(parseFloat(data[0].lat) * 10000) / 10000,
          lng: Math.round(parseFloat(data[0].lon) * 10000) / 10000,
          displayName: data[0].display_name
        };
      }
    }
  } catch (err) {
    console.warn('Geocoding search failed:', err);
  }

  return null;
}
