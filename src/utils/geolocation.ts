import { SouthAfricanProvince } from '../types';

export interface ProvinceGeoInfo {
  name: SouthAfricanProvince;
  code: string;
  centroid: { lat: number; lng: number };
  majorHubs: string[];
  description: string;
  tagline: string;
}

export const SA_PROVINCES_GEO: Record<SouthAfricanProvince, ProvinceGeoInfo> = {
  'Gauteng': {
    name: 'Gauteng',
    code: 'GP',
    centroid: { lat: -26.2041, lng: 28.0473 }, // Johannesburg
    majorHubs: ['Johannesburg', 'Pretoria', 'Boksburg', 'Midrand', 'Kempton Park', 'Centurion', 'Randburg', 'Soweto'],
    description: 'Largest automotive salvage & scrap yard network in SA',
    tagline: 'Instant collection & 24h courier dispatch'
  },
  'Western Cape': {
    name: 'Western Cape',
    code: 'WC',
    centroid: { lat: -33.9249, lng: 18.4241 }, // Cape Town
    majorHubs: ['Cape Town', 'Montague Gardens', 'Bellville', 'Paarl', 'Stellenbosch', 'George', 'Somerset West'],
    description: 'High inventory of European, German, and Japanese auto spares',
    tagline: 'Direct collection across Cape Peninsula & Boland'
  },
  'KwaZulu-Natal': {
    name: 'KwaZulu-Natal',
    code: 'KZN',
    centroid: { lat: -29.8587, lng: 31.0218 }, // Durban
    majorHubs: ['Durban', 'Pinetown', 'Pietermaritzburg', 'Umhlanga', 'Phoenix', 'Newcastle', 'Richards Bay'],
    description: 'Specialist Japanese bakkie, taxi, and commercial truck spares hub',
    tagline: 'Port-adjacent scrap yards & fast regional freight'
  },
  'Eastern Cape': {
    name: 'Eastern Cape',
    code: 'EC',
    centroid: { lat: -33.9608, lng: 25.6022 }, // Gqeberha / Port Elizabeth
    majorHubs: ['Gqeberha (Port Elizabeth)', 'East London', 'Uitenhage', 'Mthatha', 'Queenstown'],
    description: 'Automotive manufacturing capital (VW, Isuzu, Ford engine parts)',
    tagline: 'Factory-tested spares & coastal delivery'
  },
  'Free State': {
    name: 'Free State',
    code: 'FS',
    centroid: { lat: -29.1181, lng: 26.2249 }, // Bloemfontein
    majorHubs: ['Bloemfontein', 'Welkom', 'Sasolburg', 'Kroonstad', 'Bethlehem'],
    description: 'Central hub for agricultural bakkies, 4x4s, and diesel truck parts',
    tagline: 'Central cross-country logistics & collection'
  },
  'Mpumalanga': {
    name: 'Mpumalanga',
    code: 'MP',
    centroid: { lat: -25.4753, lng: 30.9694 }, // Mbombela / Nelspruit
    majorHubs: ['Mbombela (Nelspruit)', 'eMalahleni (Witbank)', 'Middelburg', 'Secunda'],
    description: 'Mining truck, heavy-duty commercial, and bakkie dismantlers',
    tagline: 'High-density heavy vehicle & mining spares'
  },
  'Limpopo': {
    name: 'Limpopo',
    code: 'LP',
    centroid: { lat: -23.9045, lng: 29.4688 }, // Polokwane
    majorHubs: ['Polokwane', 'Tzaneen', 'Mokopane', 'Thohoyandou', 'Bela-Bela'],
    description: 'Bakkie 4x4 drivetrain, suspension, and cross-border transport parts',
    tagline: 'Bakkie & fleet spares specialist yards'
  },
  'North West': {
    name: 'North West',
    code: 'NW',
    centroid: { lat: -25.6667, lng: 27.2424 }, // Rustenburg
    majorHubs: ['Rustenburg', 'Potchefstroom', 'Klerksdorp', 'Mahikeng', 'Brits'],
    description: 'Heavy duty axles, farm bakkies, and commercial scrap yards',
    tagline: 'Platinum belt & agricultural auto spares'
  },
  'Northern Cape': {
    name: 'Northern Cape',
    code: 'NC',
    centroid: { lat: -28.7419, lng: 24.7639 }, // Kimberley
    majorHubs: ['Kimberley', 'Upington', 'Springbok', 'Kuruman', 'De Aar'],
    description: 'Long-haul transport spares and heavy-duty 4x4 components',
    tagline: 'Wide-area courier network & verified yards'
  }
};

/**
 * Calculates straight-line distance in kilometers using the Haversine formula
 */
export function calculateHaversineDistanceKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

/**
 * Resolves the closest South African province given latitude and longitude coordinates.
 */
export function matchCoordinatesToProvince(lat: number, lng: number): {
  province: SouthAfricanProvince;
  distanceKm: number;
} {
  let closestProvince: SouthAfricanProvince = 'Gauteng';
  let minDistance = Infinity;

  const provinces = Object.keys(SA_PROVINCES_GEO) as SouthAfricanProvince[];
  for (const prov of provinces) {
    const geo = SA_PROVINCES_GEO[prov];
    const dist = calculateHaversineDistanceKm(lat, lng, geo.centroid.lat, geo.centroid.lng);
    if (dist < minDistance) {
      minDistance = dist;
      closestProvince = prov;
    }
  }

  return { province: closestProvince, distanceKm: minDistance };
}

export interface GeolocationResult {
  success: boolean;
  province?: SouthAfricanProvince;
  city?: string;
  latitude?: number;
  longitude?: number;
  accuracyKm?: number;
  error?: string;
}

/**
 * Request user's geolocation via browser API and identify South African province
 */
export async function detectUserProvince(): Promise<GeolocationResult> {
  if (typeof window === 'undefined' || !navigator.geolocation) {
    return {
      success: false,
      error: 'Geolocation is not supported by your browser.'
    };
  }

  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const accuracyKm = accuracy ? Math.round(accuracy / 1000) : undefined;

        // Try reverse-geocoding via OpenStreetMap with short timeout for exact province/city
        let detectedCity: string | undefined;
        let detectedProvince: SouthAfricanProvince | undefined;

        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
            { signal: controller.signal, headers: { 'Accept-Language': 'en' } }
          );
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            const address = data.address || {};
            const state = (address.state || address.province || address.region || '').toLowerCase();
            const city = address.city || address.town || address.municipality || address.suburb;
            detectedCity = city;

            // Match address state to SA Province
            if (state.includes('gauteng')) detectedProvince = 'Gauteng';
            else if (state.includes('western cape')) detectedProvince = 'Western Cape';
            else if (state.includes('kwazulu') || state.includes('natal')) detectedProvince = 'KwaZulu-Natal';
            else if (state.includes('eastern cape')) detectedProvince = 'Eastern Cape';
            else if (state.includes('free state')) detectedProvince = 'Free State';
            else if (state.includes('mpumalanga')) detectedProvince = 'Mpumalanga';
            else if (state.includes('limpopo')) detectedProvince = 'Limpopo';
            else if (state.includes('north west')) detectedProvince = 'North West';
            else if (state.includes('northern cape')) detectedProvince = 'Northern Cape';
          }
        } catch {
          // Fallback to mathematical centroid distance if network request fails or times out
        }

        // If reverse-geocoding didn't match a province, use distance matching
        if (!detectedProvince) {
          const matched = matchCoordinatesToProvince(latitude, longitude);
          detectedProvince = matched.province;
        }

        resolve({
          success: true,
          province: detectedProvince,
          city: detectedCity,
          latitude,
          longitude,
          accuracyKm
        });
      },
      (geoError) => {
        let message = 'Unable to retrieve location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          message = 'Location permission was denied. Please select your province manually.';
        } else if (geoError.code === geoError.POSITION_UNAVAILABLE) {
          message = 'Location information is currently unavailable.';
        } else if (geoError.code === geoError.TIMEOUT) {
          message = 'Location request timed out.';
        }
        resolve({
          success: false,
          error: message
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 600000 // Cache for 10 minutes
      }
    );
  });
}
