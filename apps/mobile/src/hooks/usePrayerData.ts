import { useQuery } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import * as Location from 'expo-location';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const API_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ??
  'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface PrayerTimings {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerTimesResponse {
  timings: PrayerTimings;
  date?: {
    gregorian?: {
      date: string;
    };
    hijri?: {
      date: string;
      day: string;
      month: {
        en: string;
        ar: string;
      };
      year: string;
    };
  };
}

export interface NextPrayer {
  name: string;
  time: Date;
  location: string;
}

export interface PrayerTime {
  name: string;
  time: string;
}

export interface HijriDateInfo {
  day: string;
  month: string;
  year: string;
  formatted: string;
}

const LOCATION_OVERRIDE_KEY = 'prayer_location_override';

// Get user location
export const useLocation = () => {
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [location, setLocation] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const refreshLocation = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    const fetchLocation = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // First, check for a manual override saved in SecureStore
        const overrideRaw = await SecureStore.getItemAsync(LOCATION_OVERRIDE_KEY);
        if (overrideRaw) {
          try {
            const override = JSON.parse(overrideRaw) as {
              lat: number;
              lng: number;
              label?: string;
            };
            if (override.lat && override.lng) {
              setCoords({ lat: override.lat, lng: override.lng });
              setLocation(override.label || 'Custom location');
              setIsLoading(false);
              return;
            }
          } catch {
            // If parsing fails, fall back to automatic location
          }
        }

        // Check if we have permission first
        const { status: existingStatus } = await Location.getForegroundPermissionsAsync();
        let finalStatus = existingStatus;

        // If permission not granted, request it
        if (existingStatus !== 'granted') {
          const { status } = await Location.requestForegroundPermissionsAsync();
          finalStatus = status;
        }

        if (finalStatus !== 'granted') {
          setError('Location permission required');
          setLocation('Location unavailable');
          setIsLoading(false);
          return;
        }

        // Get current position
        const position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          timeout: 15000, // 15 second timeout
        });

        const { latitude, longitude } = position.coords;
        setCoords({ lat: latitude, lng: longitude });

        // Reverse geocode to get location name
        try {
          const reverseGeocode = await Location.reverseGeocodeAsync({
            latitude,
            longitude,
          });
          if (reverseGeocode && reverseGeocode.length > 0) {
            const addr = reverseGeocode[0];
            const city = addr.city || addr.subAdministrativeArea || addr.district || '';
            const country = addr.country || '';
            const locationStr = city && country ? `${city}, ${country}` : country || city || 'Unknown location';
            setLocation(locationStr);
          } else {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
          }
        } catch (geocodeError) {
          // If geocoding fails, use coordinates
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`);
        }
      } catch (err) {
        const errorMessage = (err as Error).message || 'Failed to get location';
        setError(errorMessage);
        setLocation('Location unavailable');
        console.error('Location error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchLocation();
  }, [refreshKey]);

  return { coords, location, isLoading, error, refreshLocation };
};

// Fetch prayer times from API
export const usePrayerTimes = (coords: { lat: number; lng: number } | null) => {
  return useQuery<PrayerTimesResponse>({
    queryKey: ['prayerTimes', coords],
    queryFn: async () => {
      if (!coords) throw new Error('No coordinates');
      const res = await fetch(
        `${API_BASE_URL}/api/prayer-times?lat=${coords.lat}&lng=${coords.lng}`,
      );
      if (!res.ok) throw new Error('Failed to fetch prayer times');
      return (await res.json()) as PrayerTimesResponse;
    },
    enabled: !!coords,
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    refetchInterval: 1000 * 60 * 60, // Refetch every hour
  });
};

// Calculate next prayer
export const useNextPrayer = (coords?: { lat: number; lng: number } | null) => {
  const locationData = useLocation();
  const actualCoords = coords || locationData.coords;
  const { data: prayerData } = usePrayerTimes(actualCoords);

  return useMemo(() => {
    if (!prayerData?.timings) {
      return {
        name: 'Loading...',
        time: new Date(Date.now() + 2 * 60 * 60 * 1000),
        location: locationData.location || 'Loading...',
        countdown: '--:--',
      };
    }

    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const timings = prayerData.timings;

    // Parse prayer times for today
    const prayers: Array<{ name: string; time: Date }> = [
      { name: 'Fajr', time: parseTime(today, timings.Fajr) },
      { name: 'Dhuhr', time: parseTime(today, timings.Dhuhr) },
      { name: 'Asr', time: parseTime(today, timings.Asr) },
      { name: 'Maghrib', time: parseTime(today, timings.Maghrib) },
      { name: 'Isha', time: parseTime(today, timings.Isha) },
    ];

    // Find next prayer
    const next = prayers.find(p => p.time > now) || prayers[0];
    let nextPrayerTime = next.time;
    
    if (!next || next.time <= now) {
      // All prayers passed, use Fajr tomorrow
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      nextPrayerTime = parseTime(tomorrowStr, timings.Fajr);
    }

    // Calculate countdown
    const diff = nextPrayerTime.getTime() - now.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const countdown = `${hours}h ${minutes}m`;

    return {
      name: next.name,
      time: nextPrayerTime,
      location: locationData.location || 'Unknown',
      countdown,
    };
  }, [prayerData, locationData.location]);
};

// Get all prayer times for today
export const usePrayerTimesToday = (): PrayerTime[] => {
  const { coords } = useLocation();
  const { data: prayerData } = usePrayerTimes(coords);

  return useMemo(() => {
    if (!prayerData?.timings) {
      return [
        { name: 'Fajr', time: '--:--' },
        { name: 'Dhuhr', time: '--:--' },
        { name: 'Asr', time: '--:--' },
        { name: 'Maghrib', time: '--:--' },
        { name: 'Isha', time: '--:--' },
      ];
    }

    const timings = prayerData.timings;
    return [
      { name: 'Fajr', time: formatTime(timings.Fajr) },
      { name: 'Dhuhr', time: formatTime(timings.Dhuhr) },
      { name: 'Asr', time: formatTime(timings.Asr) },
      { name: 'Maghrib', time: formatTime(timings.Maghrib) },
      { name: 'Isha', time: formatTime(timings.Isha) },
    ];
  }, [prayerData]);
};

// Get Hijri date
export const useHijriDate = (): HijriDateInfo | null => {
  const { coords } = useLocation();
  const { data: prayerData } = usePrayerTimes(coords);

  return useMemo(() => {
    // Prefer Hijri date from the API (Aladhan via /api/prayer-times)
    if (prayerData?.date?.hijri) {
      const hijri = prayerData.date.hijri as any;
      return {
        day: String(hijri.day),
        month: String(hijri.month?.en ?? ''),
        year: String(hijri.year),
        formatted: `${hijri.day} ${hijri.month?.en ?? ''} ${hijri.year} AH`,
      };
    }

    // If we don't have Hijri metadata, just return null and let the UI show a fallback string.
    return null;
  }, [prayerData]);
};

// Helper: Parse time string (HH:MM) to Date
function parseTime(dateStr: string, timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date(`${dateStr}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`);
  return date;
}

// Helper: Format time string (HH:MM) from API format
function formatTime(timeStr: string): string {
  const [hours, minutes] = timeStr.split(':');
  return `${hours}:${minutes}`;
}

