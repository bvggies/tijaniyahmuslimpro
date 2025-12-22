import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARKS_KEY = 'beginners_bookmarks';

export interface BeginnersBookmark {
  id: string;
  type: 'phrase' | 'term';
  term: string;
  alt?: string;
  definition: string;
  timestamp: number;
}

export const beginnersBookmarksService = {
  async getAllBookmarks(): Promise<BeginnersBookmark[]> {
    try {
      const data = await AsyncStorage.getItem(BOOKMARKS_KEY);
      if (!data) return [];
      return JSON.parse(data) as BeginnersBookmark[];
    } catch {
      return [];
    }
  },

  async addBookmark(bookmark: Omit<BeginnersBookmark, 'timestamp'>): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks();
      const newBookmark: BeginnersBookmark = {
        ...bookmark,
        timestamp: Date.now(),
      };
      // Check if already exists
      const exists = bookmarks.some((b) => b.id === bookmark.id && b.type === bookmark.type);
      if (!exists) {
        bookmarks.push(newBookmark);
        await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(bookmarks));
      }
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  },

  async removeBookmark(id: string, type: 'phrase' | 'term'): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks();
      const filtered = bookmarks.filter((b) => !(b.id === id && b.type === type));
      await AsyncStorage.setItem(BOOKMARKS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  },

  async isBookmarked(id: string, type: 'phrase' | 'term'): Promise<boolean> {
    try {
      const bookmarks = await this.getAllBookmarks();
      return bookmarks.some((b) => b.id === id && b.type === type);
    } catch {
      return false;
    }
  },

  async toggleBookmark(bookmark: Omit<BeginnersBookmark, 'timestamp'>): Promise<boolean> {
    const isBookmarked = await this.isBookmarked(bookmark.id, bookmark.type);
    if (isBookmarked) {
      await this.removeBookmark(bookmark.id, bookmark.type);
      return false;
    } else {
      await this.addBookmark(bookmark);
      return true;
    }
  },
};

