import AsyncStorage from '@react-native-async-storage/async-storage';

const BOOKMARK_KEY = 'tasawwuf_part1_bookmark';
const HIGHLIGHTS_KEY = 'tasawwuf_part1_highlights';
const PROGRESS_KEY = 'tasawwuf_part1_progress';
const NOTES_KEY = 'tasawwuf_part1_notes';

export interface Highlight {
  blockId: string;
  text: string;
  note?: string;
  timestamp: number;
}

export const readerStorage = {
  // Bookmark
  async isBookmarked(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(BOOKMARK_KEY);
      return value === 'true';
    } catch {
      return false;
    }
  },

  async setBookmark(bookmarked: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(BOOKMARK_KEY, String(bookmarked));
    } catch (error) {
      console.error('Error saving bookmark:', error);
    }
  },

  // Highlights
  async getHighlights(): Promise<Highlight[]> {
    try {
      const data = await AsyncStorage.getItem(HIGHLIGHTS_KEY);
      if (!data) return [];
      return JSON.parse(data) as Highlight[];
    } catch {
      return [];
    }
  },

  async addHighlight(highlight: Omit<Highlight, 'timestamp'>): Promise<void> {
    try {
      const highlights = await this.getHighlights();
      const newHighlight: Highlight = {
        ...highlight,
        timestamp: Date.now(),
      };
      highlights.push(newHighlight);
      await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(highlights));
    } catch (error) {
      console.error('Error adding highlight:', error);
    }
  },

  async removeHighlight(blockId: string): Promise<void> {
    try {
      const highlights = await this.getHighlights();
      const filtered = highlights.filter((h) => h.blockId !== blockId);
      await AsyncStorage.setItem(HIGHLIGHTS_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Error removing highlight:', error);
    }
  },

  // Progress
  async getProgress(): Promise<number> {
    try {
      const value = await AsyncStorage.getItem(PROGRESS_KEY);
      return value ? parseFloat(value) : 0;
    } catch {
      return 0;
    }
  },

  async setProgress(progress: number): Promise<void> {
    try {
      await AsyncStorage.setItem(PROGRESS_KEY, String(progress));
    } catch (error) {
      console.error('Error saving progress:', error);
    }
  },

  // Notes
  async getNote(blockId: string): Promise<string | null> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      if (!data) return null;
      const notes = JSON.parse(data) as Record<string, string>;
      return notes[blockId] || null;
    } catch {
      return null;
    }
  },

  async setNote(blockId: string, note: string): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(NOTES_KEY);
      const notes = data ? (JSON.parse(data) as Record<string, string>) : {};
      notes[blockId] = note;
      await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(notes));
    } catch (error) {
      console.error('Error saving note:', error);
    }
  },
};

