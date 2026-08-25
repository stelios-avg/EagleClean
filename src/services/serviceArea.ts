import * as Location from 'expo-location';

// Center of Nicosia (Plateia Eleftherias area). The radius covers the
// greater urban area: Strovolos, Lakatamia, Latsia, Geri, Tseri, Egkomi.
const NICOSIA_CENTER = { latitude: 35.1725, longitude: 33.3567 };
const SERVICE_RADIUS_KM = 18;

export type ServiceAreaStatus =
  | 'inside'
  | 'outside'
  | 'permission-denied'
  | 'unavailable';

function distanceKm(
  a: { latitude: number; longitude: number },
  b: { latitude: number; longitude: number }
): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/**
 * Checks whether the device is inside the Nicosia service area.
 * Bookings are only accepted from within it.
 */
export async function checkServiceArea(): Promise<ServiceAreaStatus> {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return 'permission-denied';
    }

    // Last known fix is instant. A fresh GPS read can hang indoors, so
    // cap it at 8s and prefer a coarser (faster) accuracy.
    const lastKnown = await Location.getLastKnownPositionAsync({
      maxAge: 30 * 60 * 1000,
    });
    const position =
      lastKnown ??
      (await Promise.race([
        Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Low }),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Location request timed out')), 8000)
        ),
      ]));

    const km = distanceKm(position.coords, NICOSIA_CENTER);
    return km <= SERVICE_RADIUS_KM ? 'inside' : 'outside';
  } catch {
    return 'unavailable';
  }
}
