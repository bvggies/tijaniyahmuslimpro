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
        console.warn('Non-JSON response from Quran API:', text.substring(0, 100));
        return this.getFallbackSurahs();
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        console.warn('Empty response from Quran API');
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
        console.warn('Invalid data structure from Quran API:', data);
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
      const response = await fetch(`${QURAN_API_BASE}/surah/${surahNumber}/${edition}`, {
        headers: {
          'Accept': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch surah: ${response.status} ${response.statusText}`);
      }

      // Check if response is actually JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`Non-JSON response: ${text.substring(0, 100)}`);
      }

      const text = await response.text();
      if (!text || text.trim().length === 0) {
        throw new Error('Empty response from Quran API');
      }

      let data;
      try {
        data = JSON.parse(text);
      } catch (parseError) {
        console.error('JSON parse error. Response text:', text.substring(0, 200));
        throw new Error(`Invalid JSON response: ${parseError}`);
      }
      
      if (!data || !data.data) {
        throw new Error('Invalid data structure from Quran API');
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
    } catch (error: any) {
      if (__DEV__) {
        console.error('Error fetching surah:', error?.message || error);
      }
      throw error;
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
};

