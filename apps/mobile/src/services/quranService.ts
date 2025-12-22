/**
 * Quran Service - Fetches Quran data from Al-Quran Cloud API
 * API: https://alquran.cloud/api
 */

const QURAN_API_BASE = 'https://api.alquran.cloud/v1';

export interface SurahMetadata {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface AyahData {
  number: number;
  text: string;
  numberInSurah: number;
  juz: number;
  manzil: number;
  page: number;
  ruku: number;
  hizbQuarter: number;
  sajda: boolean;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
  ayahs: AyahData[];
}

export const quranService = {
  /**
   * Get all surahs metadata
   */
  async getSurahs(): Promise<SurahMetadata[]> {
    try {
      const response = await fetch(`${QURAN_API_BASE}/surah`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch surahs: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        if (__DEV__) {
          console.warn('Non-JSON response from Quran API:', text.substring(0, 100));
        }
        return this.getFallbackSurahs();
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        if (__DEV__) {
          console.warn('Empty response from Quran API, using fallback data');
        }
        return this.getFallbackSurahs();
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error. Response text:', text.substring(0, 200));
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
      
      if (!data || !data.data || !Array.isArray(data.data)) {
        if (__DEV__) {
          console.warn('Invalid data structure from Quran API:', data);
        }
        return this.getFallbackSurahs();
      }
      
      return data.data.map((s: any) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        englishNameTranslation: s.englishNameTranslation,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType === 'Meccan' ? 'Meccan' : 'Medinan',
      }));
    } catch (error: any) {
      // Log error details for debugging
      if (__DEV__) {
        console.error('Error fetching surahs:', error?.message || error);
      }
      // Fallback to basic surah list if API fails
      return this.getFallbackSurahs();
    }
  },

  /**
   * Get full surah with all ayahs
   */
  async getSurah(surahNumber: number, edition: string = 'quran-uthmani'): Promise<SurahData> {
    try {
      // Add timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      try {
        const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${edition}`, {
          headers: {
            'Accept': 'application/json',
          },
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);

        if (!response.ok) {
          if (__DEV__) {
            console.warn(`Failed to fetch surah ${surahNumber}: ${response.status} ${response.statusText}`);
          }
          return this.getFallbackSurah(surahNumber);
        }

        // Check if response is actually JSON
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          if (__DEV__) {
            console.warn(`Non-JSON response for surah ${surahNumber}:`, text.substring(0, 100));
          }
          return this.getFallbackSurah(surahNumber);
        }

        const text = await response.text();
        if (!text || text.trim().length === 0) {
          if (__DEV__) {
            console.warn(`Empty response from Quran API for surah ${surahNumber}, using fallback data`);
          }
          return this.getFallbackSurah(surahNumber);
        }

        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          if (__DEV__) {
            console.warn('JSON parse error. Response text:', text.substring(0, 200));
          }
          return this.getFallbackSurah(surahNumber);
        }
        
        if (!data || !data.data) {
          if (__DEV__) {
            console.warn('Invalid data structure from Quran API for surah', surahNumber);
          }
          return this.getFallbackSurah(surahNumber);
        }
        
        const surah = data.data;
        return {
          number: surah.number,
          name: surah.name,
          englishName: surah.englishName,
          englishNameTranslation: surah.englishNameTranslation,
          numberOfAyahs: surah.numberOfAyahs,
          revelationType: surah.revelationType === 'Meccan' ? 'Meccan' : 'Medinan',
          ayahs: surah.ayahs.map((a: any) => ({
            number: a.number,
            text: a.text,
            numberInSurah: a.numberInSurah,
            juz: a.juz,
            manzil: a.manzil,
            page: a.page,
            ruku: a.ruku,
            hizbQuarter: a.hizbQuarter,
            sajda: a.sajda?.recommended || false,
          })),
        };
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          if (__DEV__) {
            console.warn(`Request timeout for surah ${surahNumber}`);
          }
        } else if (__DEV__) {
          console.warn(`Error fetching surah ${surahNumber}:`, fetchError?.message || fetchError);
        }
        return this.getFallbackSurah(surahNumber);
      }
    } catch (error: any) {
      if (__DEV__) {
        console.warn('Unexpected error fetching surah:', error?.message || error);
      }
      return this.getFallbackSurah(surahNumber);
    }
  },

  /**
   * Get translation for a surah
   */
  async getSurahTranslation(
    surahNumber: number,
    translation: string = 'en.asad',
  ): Promise<{ ayahs: Array<{ number: number; text: string }> }> {
    try {
      const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${translation}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        return { ayahs: [] };
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        return { ayahs: [] };
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        return { ayahs: [] };
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        if (__DEV__) {
          console.warn('JSON parse error for translation:', parseError);
        }
        return { ayahs: [] };
      }
      
      if (!data || !data.data || !data.data.ayahs) {
        return { ayahs: [] };
      }

      return {
        ayahs: data.data.ayahs.map((a: any) => ({
          number: a.number,
          text: a.text,
        })),
      };
    } catch (error) {
      if (__DEV__) {
        console.warn('Error fetching translation:', error);
      }
      return { ayahs: [] };
    }
  },

  /**
   * Fallback surah list (first 10 surahs) if API fails
   */
  getFallbackSurahs(): SurahMetadata[] {
    return [
      { number: 1, name: 'الفاتحة', englishName: 'Al-Fatiha', englishNameTranslation: 'The Opening', numberOfAyahs: 7, revelationType: 'Meccan' },
      { number: 2, name: 'البقرة', englishName: 'Al-Baqarah', englishNameTranslation: 'The Cow', numberOfAyahs: 286, revelationType: 'Medinan' },
      { number: 3, name: 'آل عمران', englishName: 'Ali Imran', englishNameTranslation: 'Family of Imran', numberOfAyahs: 200, revelationType: 'Medinan' },
      { number: 4, name: 'النساء', englishName: 'An-Nisa', englishNameTranslation: 'The Women', numberOfAyahs: 176, revelationType: 'Medinan' },
      { number: 5, name: 'المائدة', englishName: 'Al-Maidah', englishNameTranslation: 'The Table Spread', numberOfAyahs: 120, revelationType: 'Medinan' },
      { number: 6, name: 'الأنعام', englishName: 'Al-An\'am', englishNameTranslation: 'The Cattle', numberOfAyahs: 165, revelationType: 'Meccan' },
      { number: 7, name: 'الأعراف', englishName: 'Al-A\'raf', englishNameTranslation: 'The Heights', numberOfAyahs: 206, revelationType: 'Meccan' },
      { number: 8, name: 'الأنفال', englishName: 'Al-Anfal', englishNameTranslation: 'The Spoils of War', numberOfAyahs: 75, revelationType: 'Medinan' },
      { number: 9, name: 'التوبة', englishName: 'At-Tawbah', englishNameTranslation: 'The Repentance', numberOfAyahs: 129, revelationType: 'Medinan' },
      { number: 10, name: 'يونس', englishName: 'Yunus', englishNameTranslation: 'Jonah', numberOfAyahs: 109, revelationType: 'Meccan' },
    ];
  },

  /**
   * Fallback surah data if API fails for a specific surah
   */
  getFallbackSurah(surahNumber: number): SurahData {
    // Get basic surah info from fallback list
    const fallbackSurahs = this.getFallbackSurahs();
    const surahInfo = fallbackSurahs.find((s) => s.number === surahNumber) || {
      number: surahNumber,
      name: `Surah ${surahNumber}`,
      englishName: `Surah ${surahNumber}`,
      englishNameTranslation: `Surah ${surahNumber}`,
      numberOfAyahs: 0,
      revelationType: 'Meccan' as const,
    };

    // Return minimal surah data with empty ayahs
    // The UI should handle this gracefully
    return {
      number: surahInfo.number,
      name: surahInfo.name,
      englishName: surahInfo.englishName,
      englishNameTranslation: surahInfo.englishNameTranslation,
      numberOfAyahs: surahInfo.numberOfAyahs,
      revelationType: surahInfo.revelationType,
      ayahs: [], // Empty ayahs - UI should show a message
    };
  },
};

