import * as SecureStore from 'expo-secure-store';

const BOOKMARKS_KEY = 'tijaniyah_bookmarks';

export interface Bookmark {
  id: string;
  type: 'card' | 'screen';
  screenId?: string;
  cardId?: string;
  title: string;
  content?: string;
  timestamp: number;
}

export const bookmarksService = {
  async getAllBookmarks(): Promise<Bookmark[]> {
    try {
      const data = await SecureStore.getItemAsync(BOOKMARKS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Bookmark[];
    } catch {
      return [];
    }
  },

  async addBookmark(bookmark: Omit<Bookmark, 'timestamp'>): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks();
      const newBookmark: Bookmark = {
        ...bookmark,
        timestamp: Date.now(),
      };
      bookmarks.push(newBookmark);
      await SecureStore.setItemAsync(BOOKMARKS_KEY, JSON.stringify(bookmarks));
    } catch (error) {
      console.error('Error adding bookmark:', error);
    }
  },

  async removeBookmark(id: string): Promise<void> {
    try {
      const bookmarks = await this.getAllBookmarks();
      const filtered = bookmarks.filter((b) => b.id !== id);
      await SecureStore.setItemAsync(BOOKMARKS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing bookmark:', error);
    }
  },

  async isBookmarked(id: string): Promise<boolean> {
    try {
      const bookmarks = await this.getAllBookmarks();
      return bookmarks.some((b) => b.id === id);
    } catch {
      return false;
    }
  },

  async toggleBookmark(bookmark: Omit<Bookmark, 'timestamp'>): Promise<boolean> {
    const isBookmarked = await this.isBookmarked(bookmark.id);
    if (isBookmarked) {
      await this.removeBookmark(bookmark.id);
      return false;
    } else {
      await this.addBookmark(bookmark);
      return true;
    }
  },
};

