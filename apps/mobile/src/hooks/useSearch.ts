import { useMemo } from 'react';
import { useSurahs } from './useQuran';
import { useDuas } from './useDuas';
import { usePosts } from './useCommunity';
import type { Post } from './useCommunity';
import apiClient from '../services/apiClient';
import { useQuery } from '@tanstack/react-query';
import { FEATURE_ROUTES } from '../navigation/featureRoutes';
import { tariqaTijaniyyahContent } from '../data/tijaniyah/tariqaTijaniyyahContent';
import { tijaniyaFiqhContent } from '../data/tijaniyah/tijaniyaFiqhContent';
import { beginnersPhrasesSections } from '../data/tijaniyah/beginnersPhrases';
import { beginnersTermsSections } from '../data/tijaniyah/beginnersTerms';
import { tasawwufPart1Data } from '../data/tijaniyah/tasawwuf_part1';
import { DUAS_OF_TIJANIYAH } from '../data/tijaniyah/duasOfTijaniyah';
import * as SecureStore from 'expo-secure-store';

export type SearchCategory = 'all' | 'quran' | 'duas' | 'scholars' | 'tijaniyah' | 'community' | 'events' | 'features' | 'journal';

export interface SearchResult {
  id: string;
  type: 'quran' | 'dua' | 'scholar' | 'tijaniyah' | 'community' | 'event' | 'feature' | 'journal' | 'scholar-content';
  title: string;
  subtitle?: string;
  description?: string;
  metadata?: Record<string, any>;
  icon?: string;
}

interface Scholar {
  id: string;
  name: string;
  bio?: string;
  specialization?: string;
  contents?: ScholarContent[];
}

interface ScholarContent {
  id: string;
  title: string;
  body: string;
}

interface Event {
  id: string;
  title: string;
  description?: string;
  date?: string;
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  mood?: string;
  category?: string;
}

// Search in Quran
const searchQuran = (surahs: any[], query: string): SearchResult[] => {
  if (!surahs || surahs.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  surahs.forEach((surah) => {
    const matchesName = 
      surah.name?.toLowerCase().includes(lowerQuery) ||
      surah.englishName?.toLowerCase().includes(lowerQuery) ||
      surah.number?.toString().includes(query);
    
    if (matchesName) {
      results.push({
        id: `quran-${surah.number}`,
        type: 'quran',
        title: surah.englishName || surah.name,
        subtitle: surah.name,
        description: `Surah ${surah.number} • ${surah.numberOfAyahs} ayahs • ${surah.revelationType}`,
        metadata: {
          surahNumber: surah.number,
          surahName: surah.name,
          englishName: surah.englishName,
        },
        icon: 'book',
      });
    }
  });
  
  return results;
};

// Search in Duas
const searchDuas = (duas: any[], query: string): SearchResult[] => {
  if (!duas || duas.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  duas.forEach((dua) => {
    const matches =
      dua.title?.toLowerCase().includes(lowerQuery) ||
      dua.arabic?.toLowerCase().includes(lowerQuery) ||
      dua.translation?.toLowerCase().includes(lowerQuery) ||
      dua.transliteration?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `dua-${dua.id}`,
        type: 'dua',
        title: dua.title,
        subtitle: dua.arabic,
        description: dua.translation,
        metadata: {
          duaId: dua.id,
          categoryId: dua.categoryId,
        },
        icon: 'hands',
      });
    }
  });
  
  return results;
};

// Search in Tijaniyah Duas
const searchTijaniyahDuas = (query: string): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  DUAS_OF_TIJANIYAH.forEach((dua) => {
    const matches =
      dua.title?.toLowerCase().includes(lowerQuery) ||
      dua.arabic?.toLowerCase().includes(lowerQuery) ||
      dua.translation?.toLowerCase().includes(lowerQuery) ||
      dua.transliteration?.toLowerCase().includes(lowerQuery) ||
      dua.context?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `tijaniyah-dua-${dua.id}`,
        type: 'dua',
        title: dua.title,
        subtitle: dua.arabic,
        description: dua.translation,
        metadata: {
          route: dua.route,
        },
        icon: 'hands',
      });
    }
  });
  
  return results;
};

// Search in Scholars
const searchScholars = (scholars: Scholar[], query: string): SearchResult[] => {
  if (!scholars || scholars.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  scholars.forEach((scholar) => {
    const matches =
      scholar.name?.toLowerCase().includes(lowerQuery) ||
      scholar.bio?.toLowerCase().includes(lowerQuery) ||
      scholar.specialization?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `scholar-${scholar.id}`,
        type: 'scholar',
        title: scholar.name,
        subtitle: scholar.specialization,
        description: scholar.bio,
        metadata: {
          scholarId: scholar.id,
        },
        icon: 'person',
      });
      
      // Search in scholar content sections
      if (scholar.contents) {
        scholar.contents.forEach((content) => {
          const contentMatches =
            content.title?.toLowerCase().includes(lowerQuery) ||
            content.body?.toLowerCase().includes(lowerQuery);
          
          if (contentMatches) {
            results.push({
              id: `scholar-content-${scholar.id}-${content.id}`,
              type: 'scholar-content',
              title: content.title,
              subtitle: `From ${scholar.name}`,
              description: content.body.substring(0, 150),
              metadata: {
                scholarId: scholar.id,
                contentId: content.id,
              },
              icon: 'document-text',
            });
          }
        });
      }
    }
  });
  
  return results;
};

// Search in Community Posts
const searchCommunity = (posts: any[], query: string): SearchResult[] => {
  if (!posts || posts.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  posts.forEach((post) => {
    const matches = post.content?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `community-${post.id}`,
        type: 'community',
        title: `Post by ${post.author?.name || 'Anonymous'}`,
        subtitle: post.content?.substring(0, 100),
        description: post.content,
        metadata: {
          postId: post.id,
          authorId: post.author?.id,
        },
        icon: 'chatbubbles',
      });
    }
  });
  
  return results;
};

// Search in Events
const searchEvents = (events: Event[], query: string): SearchResult[] => {
  if (!events || events.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  events.forEach((event) => {
    const matches =
      event.title?.toLowerCase().includes(lowerQuery) ||
      event.description?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `event-${event.id}`,
        type: 'event',
        title: event.title,
        subtitle: event.date,
        description: event.description,
        metadata: {
          eventId: event.id,
        },
        icon: 'calendar',
      });
    }
  });
  
  return results;
};

// Search in Journal Entries
const searchJournal = (entries: JournalEntry[], query: string): SearchResult[] => {
  if (!entries || entries.length === 0) return [];
  
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  entries.forEach((entry) => {
    const matches =
      entry.title?.toLowerCase().includes(lowerQuery) ||
      entry.content?.toLowerCase().includes(lowerQuery) ||
      entry.tags?.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
      entry.mood?.toLowerCase().includes(lowerQuery) ||
      entry.category?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `journal-${entry.id}`,
        type: 'journal',
        title: entry.title,
        subtitle: entry.category || entry.mood,
        description: entry.content.substring(0, 150),
        metadata: {
          entryId: entry.id,
        },
        icon: 'journal',
      });
    }
  });
  
  return results;
};

// Search in App Features/Pages
const searchFeatures = (query: string): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  FEATURE_ROUTES.forEach((feature) => {
    const matches =
      feature.label?.toLowerCase().includes(lowerQuery) ||
      feature.description?.toLowerCase().includes(lowerQuery) ||
      feature.category?.toLowerCase().includes(lowerQuery);
    
    if (matches) {
      results.push({
        id: `feature-${feature.key}`,
        type: 'feature',
        title: feature.label,
        subtitle: feature.category,
        description: feature.description,
        metadata: {
          route: feature.route,
          key: feature.key,
        },
        icon: feature.icon,
      });
    }
  });
  
  return results;
};

// Search in Tijaniyah content
const searchTijaniyah = (query: string): SearchResult[] => {
  const lowerQuery = query.toLowerCase();
  const results: SearchResult[] = [];
  
  // Search in Tariqa Tijaniyyah
  const tariqaKeywords = ['tariqa', 'tijaniyyah', 'tijani', 'sufi', 'tariq', 'order', 'path', 'ahmad', 'tijani', 'founder', 'expansion', 'jihad', 'practices', 'wird'];
  if (tariqaKeywords.some((kw) => lowerQuery.includes(kw))) {
    // Search in content sections
    tariqaTijaniyyahContent.forEach((section) => {
      const sectionMatches = 
        section.title?.toLowerCase().includes(lowerQuery) ||
        section.cards.some((card) => 
          card.title?.toLowerCase().includes(lowerQuery) ||
          card.body?.toLowerCase().includes(lowerQuery)
        );
      
      if (sectionMatches) {
        section.cards.forEach((card) => {
          if (
            card.title?.toLowerCase().includes(lowerQuery) ||
            card.body?.toLowerCase().includes(lowerQuery)
          ) {
            results.push({
              id: `tariqa-${section.id}-${card.id}`,
              type: 'tijaniyah',
              title: card.title,
              subtitle: section.title,
              description: card.body.substring(0, 150),
              metadata: { screen: 'TariqaTijaniyyah', sectionId: section.id, cardId: card.id },
              icon: 'book',
            });
          }
        });
      }
    });
    
    // Add main screen if no specific matches
    if (results.length === 0) {
      results.push({
        id: 'tijaniyah-tariqa',
        type: 'tijaniyah',
        title: 'Tariqa Tijaniyyah',
        subtitle: 'Learn about the Tijani path',
        description: 'Introduction to the Tijaniyyah Sufi order, its founder, expansion, and practices.',
        metadata: { screen: 'TariqaTijaniyyah' },
        icon: 'book',
      });
    }
  }
  
  // Search in Fiqh
  const fiqhKeywords = ['fiqh', 'conditions', 'lazim', 'wazifa', 'haylala', 'wird', 'waziifa', 'hailala', 'hadra'];
  if (fiqhKeywords.some((kw) => lowerQuery.includes(kw))) {
    tijaniyaFiqhContent.forEach((section) => {
      section.cards.forEach((card) => {
        if (
          card.title?.toLowerCase().includes(lowerQuery) ||
          card.body?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `fiqh-${section.id}-${card.id}`,
            type: 'tijaniyah',
            title: card.title,
            subtitle: section.title,
            description: card.body.substring(0, 150),
            metadata: { screen: 'TijaniyaFiqh', sectionId: section.id, cardId: card.id },
            icon: 'document-text',
          });
        }
      });
    });
    
    if (results.length === 0) {
      results.push({
        id: 'tijaniyah-fiqh',
        type: 'tijaniyah',
        title: 'Tijaniya Fiqh',
        subtitle: 'Conditions of Tijaniya Fiqh',
        description: 'Learn about the conditions, lazim, wazifa, and haylala.',
        metadata: { screen: 'TijaniyaFiqh' },
        icon: 'document-text',
      });
    }
  }
  
  // Search in Beginners Resources
  const beginnersKeywords = ['beginner', 'glossary', 'term', 'phrase', 'islamic term', 'arabic term', 'bismillah', 'alhamdulillah', 'inshallah', 'mashallah'];
  if (beginnersKeywords.some((kw) => lowerQuery.includes(kw))) {
    // Search in phrases
    beginnersPhrasesSections.forEach((section) => {
      section.items.forEach((item) => {
        if (
          item.term?.toLowerCase().includes(lowerQuery) ||
          item.alt?.toLowerCase().includes(lowerQuery) ||
          item.definition?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `beginners-phrase-${item.id}`,
            type: 'tijaniyah',
            title: item.term,
            subtitle: item.alt || 'Phrase',
            description: item.definition.substring(0, 150),
            metadata: { screen: 'BeginnersResources', tab: 'phrases', itemId: item.id },
            icon: 'chatbubble',
          });
        }
      });
    });
    
    // Search in terms
    beginnersTermsSections.forEach((section) => {
      section.items.forEach((item) => {
        if (
          item.term?.toLowerCase().includes(lowerQuery) ||
          item.definition?.toLowerCase().includes(lowerQuery)
        ) {
          results.push({
            id: `beginners-term-${item.id}`,
            type: 'tijaniyah',
            title: item.term,
            subtitle: 'Term',
            description: item.definition.substring(0, 150),
            metadata: { screen: 'BeginnersResources', tab: 'terms', itemId: item.id },
            icon: 'book',
          });
        }
      });
    });
    
    if (results.length === 0) {
      results.push({
        id: 'tijaniyah-beginners',
        type: 'tijaniyah',
        title: 'Resources for Beginners',
        subtitle: 'Islamic terms & phrases',
        description: 'A-Z glossary of Islamic terms and phrases for beginners.',
        metadata: { screen: 'BeginnersResources' },
        icon: 'school',
      });
    }
  }
  
  // Search in Tasawwuf
  const tasawwufKeywords = ['tasawwuf', 'dhikr', 'zikr', 'remembrance', 'proof', 'obligation', 'divine order'];
  if (tasawwufKeywords.some((kw) => lowerQuery.includes(kw))) {
    const contentMatches = tasawwufPart1Data.raw?.toLowerCase().includes(lowerQuery) ||
      tasawwufPart1Data.title?.toLowerCase().includes(lowerQuery) ||
      tasawwufPart1Data.subtitle?.toLowerCase().includes(lowerQuery);
    
    if (contentMatches) {
      results.push({
        id: 'tijaniyah-tasawwuf',
        type: 'tijaniyah',
        title: tasawwufPart1Data.title,
        subtitle: tasawwufPart1Data.subtitle,
        description: 'Learn about the importance and practice of dhikr in Islam.',
        metadata: { screen: 'ProofOfTasawwufPart1' },
        icon: 'flame',
      });
    }
  }
  
  return results;
};

export const useSearch = (query: string, category: SearchCategory = 'all') => {
  const { data: surahs } = useSurahs();
  const { data: duas } = useDuas();
  const { data: posts } = usePosts();
  
  // Fetch scholars
  const { data: scholarsData } = useQuery({
    queryKey: ['scholars', 'search'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ scholars: Scholar[] }>('/api/scholars');
        return response.scholars || [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });
  
  // Fetch events
  const { data: eventsData } = useQuery({
    queryKey: ['events', 'search'],
    queryFn: async () => {
      try {
        const response = await apiClient.get<{ events: Event[] }>('/api/events');
        return response.events || [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });
  
  // Fetch journal entries
  const { data: journalData } = useQuery({
    queryKey: ['journal', 'search'],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) return [];
        const response = await apiClient.get<{ entries: JournalEntry[] }>('/api/journal-entries');
        return response.entries || [];
      } catch {
        return [];
      }
    },
    staleTime: 30000,
  });
  
  const results = useMemo(() => {
    if (!query || query.trim().length < 2) {
      return [];
    }
    
    const trimmedQuery = query.trim();
    const allResults: SearchResult[] = [];
    
    if (category === 'all' || category === 'quran') {
      allResults.push(...searchQuran(surahs || [], trimmedQuery));
    }
    
    if (category === 'all' || category === 'duas') {
      allResults.push(...searchDuas(duas || [], trimmedQuery));
      allResults.push(...searchTijaniyahDuas(trimmedQuery));
    }
    
    if (category === 'all' || category === 'scholars') {
      allResults.push(...searchScholars(scholarsData || [], trimmedQuery));
    }
    
    if (category === 'all' || category === 'tijaniyah') {
      allResults.push(...searchTijaniyah(trimmedQuery));
    }
    
    if (category === 'all' || category === 'community') {
      allResults.push(...searchCommunity(posts || [], trimmedQuery));
    }
    
    if (category === 'all' || category === 'events') {
      allResults.push(...searchEvents(eventsData || [], trimmedQuery));
    }
    
    if (category === 'all' || category === 'features') {
      allResults.push(...searchFeatures(trimmedQuery));
    }
    
    if (category === 'all' || category === 'journal') {
      allResults.push(...searchJournal(journalData || [], trimmedQuery));
    }
    
    return allResults;
  }, [query, category, surahs, duas, posts, scholarsData, eventsData, journalData]);
  
  return {
    results,
    hasResults: results.length > 0,
    count: results.length,
  };
};
