import * as Location from 'expo-location';

export type Coords = { latitude: number; longitude: number };

export type DeviceAddressResult =
  | { ok: true; address: string; coords: Coords }
  | { ok: false; reason: 'permission-denied' | 'unavailable' };

function formatGeocoded(place: Location.LocationGeocodedAddress): string {
  if (place.formattedAddress?.trim()) {
    return place.formattedAddress.trim();
  }
  const street = [place.streetNumber, place.street].filter(Boolean).join(' ').trim();
  const parts = [street || place.name, place.district, place.city, place.postalCode]
    .map((part) => part?.trim())
    .filter((part): part is string => Boolean(part));
  return [...new Set(parts)].join(', ');
}

export async function requestDeviceCoords(
  options: {
    accuracy?: Location.LocationAccuracy;
    lastKnownMaxAgeMs?: number;
    timeoutMs?: number;
  } = {}
): Promise<DeviceAddressResult> {
  const accuracy = options.accuracy ?? Location.Accuracy.Balanced;
  const lastKnownMaxAgeMs = options.lastKnownMaxAgeMs ?? 5 * 60 * 1000;
  const timeoutMs = options.timeoutMs ?? 10_000;

  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return { ok: false, reason: 'permission-denied' };
    }

    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: lastKnownMaxAgeMs,
    });
    const position =
      lastKnown ??
      (await Promise.race([
        Location.getCurrentPositionAsync({ accuracy }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timed out')), timeoutMs)
        ),
      ]));

    return {
      ok: true,
      address: '',
      coords: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      },
    };
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
}

/** GPS pin + a readable street address for the contact form. */
export async function readDeviceAddress(): Promise<DeviceAddressResult> {
  const located = await requestDeviceCoords();
  if (!located.ok) {
    return located;
  }

  try {
    const places = await Location.reverseGeocodeAsync(located.coords);
    const address = places[0] ? formatGeocoded(places[0]) : '';
    return {
      ok: true,
      coords: located.coords,
      address: address,
    };
  } catch {
    return {
      ok: true,
      coords: located.coords,
      address: '',
    };
  }
}

/** Best-effort pin from a typed address, so admin can still show a map. */
export async function geocodeAddress(address: string): Promise<Coords | null> {
  try {
    const results = await Location.geocodeAsync(address.trim());
    const first = results[0];
    if (!first) {
      return null;
    }
    return { latitude: first.latitude, longitude: first.longitude };
  } catch {
    return null;
  }
}
