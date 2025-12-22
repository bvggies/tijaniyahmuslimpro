import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { CommonActions } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { FEATURE_ROUTES, type FeatureRouteConfig } from '../../navigation/featureRoutes';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { Chip } from '../../components/ui/Chip';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const TILE_WIDTH = (SCREEN_WIDTH - spacing.xl * 3) / 2; // 2 columns with padding

const CATEGORIES = ['All', 'Worship', 'Tijaniyah', 'Quran', 'Community', 'Tools'] as const;
type Category = typeof CATEGORIES[number];

export const AllFeaturesScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category>('All');

  const filteredFeatures = useMemo(() => {
    let filtered = FEATURE_ROUTES;

    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter((feature) => feature.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (feature) =>
          feature.label.toLowerCase().includes(query) ||
          feature.description.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleFeaturePress = (feature: FeatureRouteConfig) => {
    // Special handling for tab navigator routes
    if (feature.route === 'QuranTab' || feature.route === 'CommunityTab') {
      // Navigate to sibling tab - go up to tab navigator level
      const tabNavigator = navigation.getParent()?.getParent();
      if (tabNavigator) {
        tabNavigator.dispatch(CommonActions.navigate(feature.route));
      }
    } else {
      // Navigate to the feature's route
      navigation.navigate(feature.route as never);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => navigation.goBack()}
          style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.title}>All Features</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color={colors.pineBlue[300]} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search features..."
            placeholderTextColor={colors.pineBlue[300]}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.pineBlue[300]} />
            </Pressable>
          )}
        </View>

        {/* Category Chips */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsContainer}
        >
          {CATEGORIES.map((category) => (
            <Chip
              key={category}
              label={category}
              selected={selectedCategory === category}
              onPress={() => setSelectedCategory(category)}
            />
          ))}
        </ScrollView>

        {/* Features Grid */}
        <View style={styles.grid}>
          {filteredFeatures.length > 0 ? (
            filteredFeatures.map((feature) => (
              <Pressable
                key={feature.key}
                onPress={() => handleFeaturePress(feature)}
                style={({ pressed }) => [
                  styles.tile,
                  pressed && styles.tilePressed,
                ]}
              >
                <View style={styles.tileContent}>
                  <View style={styles.tileIconWrapper}>
                    <Ionicons
                      name={feature.icon as any}
                      size={28}
                      color={colors.evergreen[500]}
                    />
                  </View>
                  <Text style={styles.tileLabel} numberOfLines={1}>
                    {feature.label}
                  </Text>
                  <Text style={styles.tileDescription} numberOfLines={2}>
                    {feature.description}
                  </Text>
                </View>
              </Pressable>
            ))
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={48} color={colors.pineBlue[300]} />
              <Text style={styles.emptyText}>No features found</Text>
              <Text style={styles.emptySubtext}>Try a different search or category</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    ...typography.h2,
    color: colors.white,
    fontWeight: '700',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    padding: spacing.xl,
    paddingBottom: spacing.xxl,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.darkTeal[800],
    borderRadius: 16,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  searchIcon: {
    marginRight: spacing.sm,
  },
  searchInput: {
    flex: 1,
    ...typography.body,
    color: colors.pineBlue[100],
    paddingVertical: spacing.md,
  },
  clearButton: {
    padding: spacing.xs,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    paddingRight: spacing.xl,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tile: {
    width: TILE_WIDTH,
    marginBottom: spacing.md,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  tilePressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  tileContent: {
    padding: spacing.md,
    alignItems: 'center',
  },
  tileIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  tileLabel: {
    ...typography.body,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  tileDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    textAlign: 'center',
    fontSize: 11,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl * 2,
    width: '100%',
  },
  emptyText: {
    ...typography.h3,
    color: colors.white,
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  emptySubtext: {
    ...typography.body,
    color: colors.pineBlue[300],
  },
});

export default AllFeaturesScreen;

