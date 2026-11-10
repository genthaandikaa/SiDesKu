import { KEDIRI_DEFAULT_COORDS } from '../smartCityStorage';

export interface DetectedLocationResult {
  lat: number;
  lng: number;
  label: string;
  method: 'gps' | 'ip' | 'default';
  city?: string;
  accuracyMeters?: number;
  gpsErrorMessage?: string;
}

/**
 * Robust, resilient location detection for browser, desktop, and localhost environments.
 * 1. Attempts High-Accuracy Browser Geolocation first (up to 10s so user can accept prompt).
 * 2. Attempts Standard Geolocation (Wi-Fi/Cellular).
 * 3. If blocked or unavailable, falls back to IP Geolocation.
 * 4. Provides clear diagnostics on why IP fallback was used.
 */
export async function detectSmartCityLocation(): Promise<DetectedLocationResult> {
  let gpsDeniedReason: string | undefined;

  // Step 1: Try browser geolocation with High Accuracy first
  if (typeof window !== 'undefined' && 'geolocation' in navigator) {
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const lat = Math.round(pos.coords.latitude * 10000) / 10000;
      const lng = Math.round(pos.coords.longitude * 10000) / 10000;
      const acc = Math.round(pos.coords.accuracy);

      return {
        lat,
        lng,
        label: `GPS Perangkat Akurat (±${acc}m)`,
        accuracyMeters: acc,
        method: 'gps'
      };
    } catch (err1: any) {
      console.warn('High accuracy GPS failed or timed out, trying standard accuracy:', err1);
      if (err1?.code === 1) {
        gpsDeniedReason = 'Izin akses lokasi ditolak di browser/macOS Anda.';
      }

      // Step 1b: Try standard accuracy if high-accuracy timed out
      if (err1?.code !== 1) {
        try {
          const pos2 = await new Promise<GeolocationPosition>((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: false,
              timeout: 6000,
              maximumAge: 60000
            });
          });

          const lat = Math.round(pos2.coords.latitude * 10000) / 10000;
          const lng = Math.round(pos2.coords.longitude * 10000) / 10000;
          const acc = Math.round(pos2.coords.accuracy);

          return {
            lat,
            lng,
            label: `GPS Jaringan (±${acc}m)`,
            accuracyMeters: acc,
            method: 'gps'
          };
        } catch (err2: any) {
          console.warn('Standard geolocation also failed:', err2);
          if (err2?.code === 1) {
            gpsDeniedReason = 'Izin akses lokasi ditolak di browser/macOS Anda.';
          }
        }
      }
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
          method: 'ip',
          gpsErrorMessage: gpsDeniedReason
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
    method: 'default',
    gpsErrorMessage: gpsDeniedReason
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
      clean + ', Jawa Timur, Indonesia'
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
