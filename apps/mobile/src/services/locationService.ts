import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';

export interface LocationData {
  lat: number;
  lng: number;
  city?: string;
  country?: string;
  address?: string;
}

const LOCATION_CACHE_KEY = 'cached_location';

export const locationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation(): Promise<LocationData> {
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      throw new Error('Location permission denied');
    }

    const location = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
    });

    const { latitude, longitude } = location.coords;

    // Try to reverse geocode
    let city: string | undefined;
    let country: string | undefined;
    let address: string | undefined;

    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });
      if (reverseGeocode && reverseGeocode.length > 0) {
        const addr = reverseGeocode[0];
        city = addr.city || addr.subAdministrativeArea;
        country = addr.country;
        address = [addr.street, addr.city, addr.country].filter(Boolean).join(', ');
      }
    } catch {
      // Ignore geocoding errors
    }

    const locationData: LocationData = {
      lat: latitude,
      lng: longitude,
      city,
      country,
      address,
    };

    // Cache location
    await SecureStore.setItemAsync(LOCATION_CACHE_KEY, JSON.stringify(locationData));

    return locationData;
  },

  async getCachedLocation(): Promise<LocationData | null> {
    try {
      const cached = await SecureStore.getItemAsync(LOCATION_CACHE_KEY);
      if (cached) {
        return JSON.parse(cached) as LocationData;
      }
    } catch {
      // Ignore cache errors
    }
    return null;
  },

  async clearCache(): Promise<void> {
    await SecureStore.deleteItemAsync(LOCATION_CACHE_KEY);
  },
};

