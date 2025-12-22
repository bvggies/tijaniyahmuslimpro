import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { quranService, SurahMetadata, SurahData, AyahData } from '../services/quranService';

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan';
}

export interface Ayah {
  number: number;
  text: string;
  translation?: string;
  transliteration?: string;
  numberInSurah: number;
  juz?: number;
  page?: number;
  sajda?: boolean;
}

export interface Bookmark {
  id: string;
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  ayahText: string;
  createdAt: string;
}

export interface LastRead {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
}

const LAST_READ_KEY = 'last_read_quran';

export const useSurahs = () => {
  return useQuery({
    queryKey: ['quran', 'surahs'],
    queryFn: async () => {
      const surahs = await quranService.getSurahs();
      return surahs.map((s) => ({
        number: s.number,
        name: s.name,
        englishName: s.englishName,
        numberOfAyahs: s.numberOfAyahs,
        revelationType: s.revelationType,
      }));
    },
    staleTime: 1000 * 60 * 60 * 24, // Cache for 24 hours
  });
};

export const useSurah = (surahNumber: number) => {
  return useQuery({
    queryKey: ['quran', 'surah', surahNumber],
    queryFn: async () => {
      const [surahData, translationData] = await Promise.all([
        quranService.getSurah(surahNumber),
        quranService.getSurahTranslation(surahNumber).catch(() => ({ ayahs: [] })),
      ]);

      const translationMap = new Map(
        translationData.ayahs.map((t) => [t.number, t.text]),
      );

      return {
        surah: {
          number: surahData.number,
          name: surahData.name,
          englishName: surahData.englishName,
          numberOfAyahs: surahData.numberOfAyahs,
          revelationType: surahData.revelationType,
        },
        ayahs: surahData.ayahs.map((ayah) => ({
          number: ayah.number,
          text: ayah.text,
          translation: translationMap.get(ayah.number),
          numberInSurah: ayah.numberInSurah,
          juz: ayah.juz,
          page: ayah.page,
          sajda: ayah.sajda,
        })),
      };
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
};

export const useBookmarks = () => {
  return useQuery({
    queryKey: ['quran', 'bookmarks'],
    queryFn: async () => {
      const stored = await SecureStore.getItemAsync('quran_bookmarks');
      return stored ? (JSON.parse(stored) as Bookmark[]) : [];
    },
  });
};

export const useAddBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (bookmark: Omit<Bookmark, 'id' | 'createdAt'>) => {
      const bookmarks = await SecureStore.getItemAsync('quran_bookmarks');
      const existing = bookmarks ? (JSON.parse(bookmarks) as Bookmark[]) : [];
      
      // Check if bookmark already exists (same surah + ayah)
      const exists = existing.find(
        (b) => b.surahNumber === bookmark.surahNumber && b.ayahNumber === bookmark.ayahNumber,
      );
      if (exists) {
        return exists; // Return existing bookmark
      }

      const newBookmark: Bookmark = {
        ...bookmark,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
      };
      await SecureStore.setItemAsync('quran_bookmarks', JSON.stringify([...existing, newBookmark]));
      return newBookmark;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran', 'bookmarks'] });
    },
  });
};

export const useIsBookmarked = (surahNumber: number, ayahNumber: number) => {
  const { data: bookmarks } = useBookmarks();
  return bookmarks?.some(
    (b) => b.surahNumber === surahNumber && b.ayahNumber === ayahNumber,
  ) || false;
};

export const useDeleteBookmark = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const bookmarks = await SecureStore.getItemAsync('quran_bookmarks');
      const existing = bookmarks ? (JSON.parse(bookmarks) as Bookmark[]) : [];
      const filtered = existing.filter((b) => b.id !== id);
      await SecureStore.setItemAsync('quran_bookmarks', JSON.stringify(filtered));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran', 'bookmarks'] });
    },
  });
};

export const useLastRead = () => {
  return useQuery({
    queryKey: ['quran', 'lastRead'],
    queryFn: async () => {
      const stored = await SecureStore.getItemAsync(LAST_READ_KEY);
      return stored ? (JSON.parse(stored) as LastRead) : null;
    },
  });
};

export const useSaveLastRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (lastRead: LastRead) => {
      await SecureStore.setItemAsync(LAST_READ_KEY, JSON.stringify(lastRead));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quran', 'lastRead'] });
    },
  });
};

