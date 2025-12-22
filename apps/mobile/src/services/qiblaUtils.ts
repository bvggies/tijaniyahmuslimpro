/**
 * Kaaba coordinates (Mecca)
 */
export const MECCA_COORDS = {
  lat: 21.4225,
  lng: 39.8262,
};

/**
 * Calculate Qibla direction (bearing) from a location to Mecca
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @returns Bearing in degrees (0-360, where 0 is North)
 */
export function calculateQiblaBearing(lat: number, lng: number): number {
  const meccaLat = MECCA_COORDS.lat;
  const meccaLng = MECCA_COORDS.lng;

  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (meccaLat * Math.PI) / 180;
  const deltaLng = ((meccaLng - lng) * Math.PI) / 180;

  const y = Math.sin(deltaLng) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLng);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;

  return bearing;
}

/**
 * Calculate distance from a location to Mecca in kilometers
 * @param lat Latitude in degrees
 * @param lng Longitude in degrees
 * @returns Distance in kilometers
 */
export function calculateDistanceToMecca(lat: number, lng: number): number {
  const meccaLat = MECCA_COORDS.lat;
  const meccaLng = MECCA_COORDS.lng;

  const R = 6371; // Earth's radius in kilometers
  const dLat = ((meccaLat - lat) * Math.PI) / 180;
  const dLng = ((meccaLng - lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat * Math.PI) / 180) *
      Math.cos((meccaLat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return Math.round(distance);
}

/**
 * Get compass direction name from bearing
 */
export function getDirectionName(bearing: number): string {
  const directions = [
    'N',
    'NNE',
    'NE',
    'ENE',
    'E',
    'ESE',
    'SE',
    'SSE',
    'S',
    'SSW',
    'SW',
    'WSW',
    'W',
    'WNW',
    'NW',
    'NNW',
  ];
  const index = Math.round(bearing / 22.5) % 16;
  return directions[index];
}

/**
 * Normalize angle to 0-360 range
 */
export function normalizeAngle(angle: number): number {
  let normalized = angle % 360;
  if (normalized < 0) {
    normalized += 360;
  }
  return normalized;
}

/**
 * Calculate the shortest angular difference between two angles
 */
export function angleDifference(angle1: number, angle2: number): number {
  const diff = normalizeAngle(angle1 - angle2);
  return diff > 180 ? 360 - diff : diff;
}

/**
 * Check if device is aligned with Qibla (within threshold)
 */
export function isAlignedWithQibla(
  heading: number,
  qiblaBearing: number,
  threshold: number = 5
): boolean {
  const diff = angleDifference(heading, qiblaBearing);
  return diff <= threshold;
}

