import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { Button } from '../../src/components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface JournalEntryDto {
  id: string;
  title: string;
  content: string;
  tags?: string[];
  mood?: string | null;
  category?: string | null;
  isPinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

const MOODS = [
  { value: 'grateful', label: 'Grateful', icon: 'heart', color: colors.evergreen[500] },
  { value: 'reflective', label: 'Reflective', icon: 'moon', color: colors.pineBlue[300] },
  { value: 'prayerful', label: 'Prayerful', icon: 'hands', color: '#8B5CF6' },
  { value: 'peaceful', label: 'Peaceful', icon: 'leaf', color: '#10B981' },
  { value: 'hopeful', label: 'Hopeful', icon: 'sunny', color: '#F59E0B' },
];

const CATEGORIES = [
  { value: 'reflection', label: 'Reflection', icon: 'book' },
  { value: 'dua', label: 'Duʿā', icon: 'hands' },
  { value: 'lesson', label: 'Lesson', icon: 'school' },
  { value: 'gratitude', label: 'Gratitude', icon: 'heart' },
  { value: 'goal', label: 'Goal', icon: 'flag' },
];

export function JournalScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const [unlocked, setUnlocked] = useState(false);
  const [pin, setPin] = useState('');
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [showPinnedOnly, setShowPinnedOnly] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryDto | null>(null);
  const [showEntryModal, setShowEntryModal] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  
  // Form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [mood, setMood] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [isPinned, setIsPinned] = useState(false);
  
  const queryClient = useQueryClient();

  useEffect(() => {
    const check = async () => {
      const stored = await SecureStore.getItemAsync('journalPin');
      if (!stored) {
        setIsSettingPin(true);
      }
    };
    void check();
  }, []);

  // Build query params
  const queryParams = useMemo(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.append('search', searchQuery);
    if (selectedCategory) params.append('category', selectedCategory);
    if (selectedMood) params.append('mood', selectedMood);
    if (showPinnedOnly) params.append('pinned', 'true');
    return params.toString();
  }, [searchQuery, selectedCategory, selectedMood, showPinnedOnly]);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['journalEntries', queryParams],
    queryFn: async () => {
      try {
        const token = await SecureStore.getItemAsync('accessToken');
        if (!token) {
          return { entries: [], isFallback: false, isGuest: true };
        }
        const url = `${API_BASE_URL}/api/journal-entries${queryParams ? `?${queryParams}` : ''}`;
        const res = await fetch(url, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          return { entries: [], isFallback: true, isGuest: false };
        }
        const jsonData = await res.json();
        return { entries: jsonData.entries || [], isFallback: false, isGuest: false };
      } catch (err) {
        return { entries: [], isFallback: true, isGuest: false };
      }
    },
    enabled: unlocked,
    retry: 1,
    retryDelay: 1000,
  });

  const resetForm = () => {
    setTitle('');
    setContent('');
    setTags([]);
    setTagInput('');
    setMood(null);
    setCategory(null);
    setIsPinned(false);
    setEditingEntry(null);
    setShowEntryModal(false);
  };

  const openEditModal = (entry: JournalEntryDto) => {
    setEditingEntry(entry);
    setTitle(entry.title);
    setContent(entry.content);
    setTags(entry.tags || []);
    setMood(entry.mood || null);
    setCategory(entry.category || null);
    setIsPinned(entry.isPinned || false);
    setShowEntryModal(true);
  };

  const createEntry = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/journal-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, tags, mood, category, isPinned }),
      });
      if (!res.ok) throw new Error('Failed to save entry');
      return res.json();
    },
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      Alert.alert('Success', 'Entry saved successfully.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to save entry. Please try again.');
    },
  });

  const updateEntry = useMutation({
    mutationFn: async () => {
      if (!editingEntry) throw new Error('No entry to update');
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/journal-entries?id=${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ title, content, tags, mood, category, isPinned }),
      });
      if (!res.ok) throw new Error('Failed to update entry');
      return res.json();
    },
    onSuccess: async () => {
      resetForm();
      await queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      Alert.alert('Success', 'Entry updated successfully.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to update entry. Please try again.');
    },
  });

  const deleteEntry = useMutation({
    mutationFn: async (entryId: string) => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/journal-entries?id=${entryId}`, {
        method: 'DELETE',
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!res.ok) throw new Error('Failed to delete entry');
      return res.json();
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['journalEntries'] });
      Alert.alert('Success', 'Entry deleted successfully.');
    },
    onError: () => {
      Alert.alert('Error', 'Failed to delete entry. Please try again.');
    },
  });

  const handleDelete = (entry: JournalEntryDto) => {
    Alert.alert(
      'Delete Entry',
      'Are you sure you want to delete this entry? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteEntry.mutate(entry.id),
        },
      ]
    );
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleUnlock = async () => {
    const stored = await SecureStore.getItemAsync('journalPin');
    if (!stored) {
      if (pin.length < 4) {
        Alert.alert('PIN too short', 'Choose at least 4 digits.');
        return;
      }
      await SecureStore.setItemAsync('journalPin', pin);
      setUnlocked(true);
      setIsSettingPin(false);
      setPin('');
      return;
    }
    if (stored !== pin) {
      Alert.alert('Incorrect PIN', 'The PIN you entered is not correct.');
      setPin('');
      return;
    }
    setUnlocked(true);
    setPin('');
  };

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    data?.entries?.forEach((entry) => {
      entry.tags?.forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort();
  }, [data?.entries]);

  // PIN Lock Screen
  if (!unlocked) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.darkTeal[950], colors.darkTeal[900]]}
          style={styles.gradient}
        >
          <IslamicPattern />

          <View style={styles.lockContainer}>
            <GlassCard style={styles.lockCard}>
              <View style={styles.lockIconContainer}>
                <Ionicons name="lock-closed" size={48} color={colors.evergreen[500]} />
              </View>
              <Text style={styles.lockTitle}>
                {isSettingPin ? 'Set Journal PIN' : 'Journal Lock'}
              </Text>
              <Text style={styles.lockDescription}>
                {isSettingPin
                  ? 'Protect your Islamic reflections with a PIN. This will be stored securely on your device.'
                  : 'Your Islamic reflections are private to this device. Enter your PIN to unlock.'}
              </Text>

              <View style={styles.pinInputContainer}>
                <TextInput
                  value={pin}
                  onChangeText={setPin}
                  placeholder="Enter PIN"
                  placeholderTextColor={colors.pineBlue[300]}
                  keyboardType="number-pad"
                  secureTextEntry
                  maxLength={6}
                  style={styles.pinInput}
                />
              </View>

              <Button
                label={isSettingPin ? 'Set PIN & Unlock' : 'Unlock'}
                onPress={handleUnlock}
                variant="primary"
                style={styles.unlockButton}
              />
            </GlassCard>
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  // Main Journal Screen
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <IslamicPattern />

        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </Pressable>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Islamic Journal</Text>
            <Text style={styles.headerSubtitle}>Your Reflections</Text>
          </View>
          <Pressable
            onPress={async () => {
              await SecureStore.deleteItemAsync('journalPin');
              setUnlocked(false);
              setIsSettingPin(false);
            }}
            style={styles.lockButton}
          >
            <Ionicons name="lock-open" size={20} color={colors.pineBlue[100]} />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: Math.max(160, insets.bottom + 140) },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Search and Filters */}
          <View style={styles.searchSection}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colors.pineBlue[300]} style={styles.searchIcon} />
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search entries..."
                placeholderTextColor={colors.pineBlue[300]}
                style={styles.searchInput}
              />
              {searchQuery.length > 0 && (
                <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                  <Ionicons name="close-circle" size={20} color={colors.pineBlue[300]} />
                </Pressable>
              )}
            </View>
            <Pressable
              onPress={() => setShowFilters(!showFilters)}
              style={[styles.filterButton, showFilters && styles.filterButtonActive]}
            >
              <Ionicons name="options" size={20} color={showFilters ? colors.evergreen[500] : colors.pineBlue[100]} />
            </Pressable>
          </View>

          {/* Filters Panel */}
          {showFilters && (
            <GlassCard style={styles.filtersCard}>
              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Category:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                  <Pressable
                    onPress={() => setSelectedCategory(null)}
                    style={[styles.filterChip, !selectedCategory && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, !selectedCategory && styles.filterChipTextActive]}>
                      All
                    </Text>
                  </Pressable>
                  {CATEGORIES.map((cat) => (
                    <Pressable
                      key={cat.value}
                      onPress={() => setSelectedCategory(cat.value)}
                      style={[styles.filterChip, selectedCategory === cat.value && styles.filterChipActive]}
                    >
                      <Ionicons
                        name={cat.icon as any}
                        size={14}
                        color={selectedCategory === cat.value ? colors.darkTeal[950] : colors.pineBlue[300]}
                      />
                      <Text
                        style={[styles.filterChipText, selectedCategory === cat.value && styles.filterChipTextActive]}
                      >
                        {cat.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.filterRow}>
                <Text style={styles.filterLabel}>Mood:</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterChips}>
                  <Pressable
                    onPress={() => setSelectedMood(null)}
                    style={[styles.filterChip, !selectedMood && styles.filterChipActive]}
                  >
                    <Text style={[styles.filterChipText, !selectedMood && styles.filterChipTextActive]}>All</Text>
                  </Pressable>
                  {MOODS.map((m) => (
                    <Pressable
                      key={m.value}
                      onPress={() => setSelectedMood(m.value)}
                      style={[styles.filterChip, selectedMood === m.value && styles.filterChipActive]}
                    >
                      <Ionicons
                        name={m.icon as any}
                        size={14}
                        color={selectedMood === m.value ? colors.darkTeal[950] : m.color}
                      />
                      <Text
                        style={[styles.filterChipText, selectedMood === m.value && styles.filterChipTextActive]}
                      >
                        {m.label}
                      </Text>
                    </Pressable>
                  ))}
                </ScrollView>
              </View>

              <Pressable
                onPress={() => setShowPinnedOnly(!showPinnedOnly)}
                style={[styles.pinnedToggle, showPinnedOnly && styles.pinnedToggleActive]}
              >
                <Ionicons
                  name={showPinnedOnly ? 'pin' : 'pin-outline'}
                  size={18}
                  color={showPinnedOnly ? colors.evergreen[500] : colors.pineBlue[300]}
                />
                <Text style={[styles.pinnedToggleText, showPinnedOnly && styles.pinnedToggleTextActive]}>
                  Pinned Only
                </Text>
              </Pressable>
            </GlassCard>
          )}

          {/* New Entry Button */}
          <Pressable onPress={() => setShowEntryModal(true)} style={styles.newEntryButton}>
            <GlassCard style={styles.newEntryButtonCard}>
              <Ionicons name="add-circle" size={24} color={colors.evergreen[500]} />
              <Text style={styles.newEntryButtonText}>New Reflection</Text>
            </GlassCard>
          </Pressable>

          {/* Guest Mode Notice */}
          {data?.isGuest && (
            <GlassCard style={styles.fallbackNotice}>
              <View style={styles.fallbackContent}>
                <Ionicons name="information-circle" size={20} color={colors.pineBlue[300]} />
                <Text style={styles.fallbackText}>
                  Sign in to sync your journal entries across devices.
                </Text>
              </View>
            </GlassCard>
          )}

          {/* Entries List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
            </View>
          ) : data?.entries && data.entries.length > 0 ? (
            <View style={styles.entriesList}>
              {data.entries.map((entry) => {
                const moodData = MOODS.find((m) => m.value === entry.mood);
                const categoryData = CATEGORIES.find((c) => c.value === entry.category);
                return (
                  <GlassCard key={entry.id} style={[styles.entryCard, entry.isPinned && styles.entryCardPinned]}>
                    <View style={styles.entryHeader}>
                      <View style={styles.entryHeaderLeft}>
                        {entry.isPinned && (
                          <Ionicons name="pin" size={16} color={colors.evergreen[500]} style={styles.pinIcon} />
                        )}
                        <Text style={styles.entryTitle} numberOfLines={2}>
                          {entry.title}
                        </Text>
                      </View>
                      <View style={styles.entryActions}>
                        <Pressable onPress={() => openEditModal(entry)} style={styles.entryActionButton}>
                          <Ionicons name="create-outline" size={18} color={colors.pineBlue[300]} />
                        </Pressable>
                        <Pressable onPress={() => handleDelete(entry)} style={styles.entryActionButton}>
                          <Ionicons name="trash-outline" size={18} color={colors.pineBlue[300]} />
                        </Pressable>
                      </View>
                    </View>

                    <Text style={styles.entryContent} numberOfLines={4}>
                      {entry.content}
                    </Text>

                    {(entry.tags && entry.tags.length > 0) || moodData || categoryData ? (
                      <View style={styles.entryMeta}>
                        {categoryData && (
                          <View style={styles.metaBadge}>
                            <Ionicons name={categoryData.icon as any} size={12} color={colors.evergreen[500]} />
                            <Text style={styles.metaBadgeText}>{categoryData.label}</Text>
                          </View>
                        )}
                        {moodData && (
                          <View style={[styles.metaBadge, { backgroundColor: `${moodData.color}20` }]}>
                            <Ionicons name={moodData.icon as any} size={12} color={moodData.color} />
                            <Text style={[styles.metaBadgeText, { color: moodData.color }]}>{moodData.label}</Text>
                          </View>
                        )}
                        {entry.tags && entry.tags.length > 0 && (
                          <View style={styles.tagsContainer}>
                            {entry.tags.slice(0, 3).map((tag) => (
                              <View key={tag} style={styles.tagBadge}>
                                <Text style={styles.tagBadgeText}>{tag}</Text>
                              </View>
                            ))}
                            {entry.tags.length > 3 && (
                              <Text style={styles.tagMoreText}>+{entry.tags.length - 3}</Text>
                            )}
                          </View>
                        )}
                      </View>
                    ) : null}

                    <Text style={styles.entryDate}>
                      {formatDistanceToNow(new Date(entry.createdAt), { addSuffix: true })}
                    </Text>
                  </GlassCard>
                );
              })}
            </View>
          ) : (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="journal-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Entries Yet</Text>
                <Text style={styles.emptyMessage}>
                  {searchQuery || selectedCategory || selectedMood || showPinnedOnly
                    ? 'No entries match your filters. Try adjusting your search.'
                    : 'Start capturing your reflections, lessons, and duʿā moments.'}
                </Text>
              </View>
            </GlassCard>
          )}

          <View style={styles.footer} />
        </ScrollView>

        {/* Entry Modal */}
        <Modal
          visible={showEntryModal}
          animationType="slide"
          transparent
          onRequestClose={resetForm}
        >
          <SafeAreaView style={styles.modalContainer}>
            <LinearGradient
              colors={[colors.darkTeal[950], colors.darkTeal[900]]}
              style={styles.modalGradient}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>
                  {editingEntry ? 'Edit Entry' : 'New Reflection'}
                </Text>
                <Pressable onPress={resetForm} style={styles.modalCloseButton}>
                  <Ionicons name="close" size={24} color={colors.pineBlue[100]} />
                </Pressable>
              </View>

              <ScrollView
                style={styles.modalScroll}
                contentContainerStyle={styles.modalContent}
                showsVerticalScrollIndicator={false}
              >
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="Title"
                  placeholderTextColor={colors.pineBlue[300]}
                  style={styles.modalInput}
                />

                <TextInput
                  value={content}
                  onChangeText={setContent}
                  placeholder="Write your reflection, lesson, or duʿā moment..."
                  placeholderTextColor={colors.pineBlue[300]}
                  multiline
                  style={[styles.modalInput, styles.modalTextArea]}
                  textAlignVertical="top"
                />

                {/* Tags */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Tags</Text>
                  <View style={styles.tagInputRow}>
                    <TextInput
                      value={tagInput}
                      onChangeText={setTagInput}
                      placeholder="Add tag"
                      placeholderTextColor={colors.pineBlue[300]}
                      style={styles.tagInput}
                      onSubmitEditing={handleAddTag}
                    />
                    <Pressable onPress={handleAddTag} style={styles.tagAddButton}>
                      <Ionicons name="add" size={20} color={colors.evergreen[500]} />
                    </Pressable>
                  </View>
                  {tags.length > 0 && (
                    <View style={styles.tagsRow}>
                      {tags.map((tag) => (
                        <Pressable
                          key={tag}
                          onPress={() => handleRemoveTag(tag)}
                          style={styles.tagChip}
                        >
                          <Text style={styles.tagChipText}>{tag}</Text>
                          <Ionicons name="close" size={14} color={colors.pineBlue[300]} />
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>

                {/* Category */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Category</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChips}>
                    {CATEGORIES.map((cat) => (
                      <Pressable
                        key={cat.value}
                        onPress={() => setCategory(cat.value)}
                        style={[styles.modalChip, category === cat.value && styles.modalChipActive]}
                      >
                        <Ionicons
                          name={cat.icon as any}
                          size={16}
                          color={category === cat.value ? colors.darkTeal[950] : colors.pineBlue[300]}
                        />
                        <Text
                          style={[styles.modalChipText, category === cat.value && styles.modalChipTextActive]}
                        >
                          {cat.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Mood */}
                <View style={styles.modalSection}>
                  <Text style={styles.modalSectionTitle}>Mood</Text>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.modalChips}>
                    {MOODS.map((m) => (
                      <Pressable
                        key={m.value}
                        onPress={() => setMood(m.value)}
                        style={[styles.modalChip, mood === m.value && styles.modalChipActive]}
                      >
                        <Ionicons
                          name={m.icon as any}
                          size={16}
                          color={mood === m.value ? colors.darkTeal[950] : m.color}
                        />
                        <Text
                          style={[styles.modalChipText, mood === m.value && styles.modalChipTextActive]}
                        >
                          {m.label}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                </View>

                {/* Pin Toggle */}
                <Pressable
                  onPress={() => setIsPinned(!isPinned)}
                  style={[styles.pinToggle, isPinned && styles.pinToggleActive]}
                >
                  <Ionicons
                    name={isPinned ? 'pin' : 'pin-outline'}
                    size={20}
                    color={isPinned ? colors.evergreen[500] : colors.pineBlue[300]}
                  />
                  <Text style={[styles.pinToggleText, isPinned && styles.pinToggleTextActive]}>
                    Pin this entry
                  </Text>
                </Pressable>

                <View style={styles.modalActions}>
                  <Button
                    label={editingEntry ? 'Update Entry' : 'Save Entry'}
                    onPress={() => (editingEntry ? updateEntry.mutate() : createEntry.mutate())}
                    variant="primary"
                    disabled={!title.trim() || !content.trim() || createEntry.isPending || updateEntry.isPending}
                    style={styles.modalSaveButton}
                  />
                </View>
              </ScrollView>
            </LinearGradient>
          </SafeAreaView>
        </Modal>
      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  gradient: {
    flex: 1,
  },
  lockContainer: {
    flex: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  lockCard: {
    padding: spacing['2xl'],
  },
  lockIconContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  lockTitle: {
    ...typography.headingLg,
    fontSize: 24,
    color: colors.white,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  lockDescription: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 22,
  },
  pinInputContainer: {
    marginBottom: spacing.xl,
  },
  pinInput: {
    ...typography.headingLg,
    fontSize: 32,
    color: colors.white,
    textAlign: 'center',
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    letterSpacing: 8,
  },
  unlockButton: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  headerSubtitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  lockButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.lg,
  },
  searchSection: {
    flexDirection: 'row',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.white,
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  filterButtonActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  filtersCard: {
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginBottom: spacing.sm,
  },
  filterChips: {
    flexDirection: 'row',
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[700],
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  filterChipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  filterChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  filterChipTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  pinnedToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  pinnedToggleActive: {
    backgroundColor: `${colors.evergreen[500]}20`,
    borderColor: colors.evergreen[500],
  },
  pinnedToggleText: {
    ...typography.bodySm,
    fontSize: 13,
    color: colors.pineBlue[300],
  },
  pinnedToggleTextActive: {
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  newEntryButton: {
    marginBottom: spacing.lg,
  },
  newEntryButtonCard: {
    padding: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 2,
    borderColor: colors.evergreen[500],
    borderStyle: 'dashed',
  },
  newEntryButtonText: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  entriesList: {
    gap: spacing.md,
  },
  entryCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  entryCardPinned: {
    borderWidth: 1,
    borderColor: colors.evergreen[500],
    backgroundColor: `${colors.evergreen[500]}10`,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  entryHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  pinIcon: {
    marginRight: spacing.xs,
  },
  entryTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '600',
    flex: 1,
  },
  entryActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  entryActionButton: {
    padding: spacing.xs,
  },
  entryContent: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  entryMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
  },
  metaBadgeText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.xs,
  },
  tagBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[700],
  },
  tagBadgeText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
  },
  tagMoreText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
  },
  entryDate: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginTop: spacing.xs,
  },
  emptyCard: {
    padding: spacing['2xl'],
    marginTop: spacing.xl,
  },
  emptyContent: {
    alignItems: 'center',
  },
  emptyTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
  footer: {
    height: spacing['2xl'],
  },
  fallbackNotice: {
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colors.darkTeal[800],
  },
  fallbackContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  fallbackText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalGradient: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  modalTitle: {
    ...typography.headingLg,
    fontSize: 20,
    color: colors.white,
    fontWeight: '700',
  },
  modalCloseButton: {
    padding: spacing.xs,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    padding: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  modalInput: {
    ...typography.bodyMd,
    color: colors.white,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.md,
  },
  modalTextArea: {
    minHeight: 150,
  },
  modalSection: {
    marginBottom: spacing.lg,
  },
  modalSectionTitle: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
    marginBottom: spacing.sm,
    fontWeight: '600',
  },
  tagInputRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tagInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.white,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagAddButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  tagChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[700],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  tagChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[100],
  },
  modalChips: {
    flexDirection: 'row',
  },
  modalChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 16,
    backgroundColor: colors.darkTeal[700],
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  modalChipActive: {
    backgroundColor: colors.evergreen[500],
    borderColor: colors.evergreen[500],
  },
  modalChipText: {
    ...typography.bodySm,
    fontSize: 12,
    color: colors.pineBlue[300],
  },
  modalChipTextActive: {
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  pinToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.lg,
  },
  pinToggleActive: {
    backgroundColor: `${colors.evergreen[500]}20`,
    borderColor: colors.evergreen[500],
  },
  pinToggleText: {
    ...typography.bodySm,
    fontSize: 14,
    color: colors.pineBlue[300],
  },
  pinToggleTextActive: {
    color: colors.evergreen[500],
    fontWeight: '600',
  },
  modalActions: {
    marginTop: spacing.lg,
  },
  modalSaveButton: {
    width: '100%',
  },
});
