import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import apiClient from '../../services/apiClient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { EmptyState } from '../../components/ui/EmptyState';

interface User {
  id: string;
  name: string;
  email: string;
}

export const UserSearchScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', 'search', searchQuery],
    queryFn: async () => {
      const response = await apiClient.get<{ users: User[] }>(
        `/api/users-search?q=${encodeURIComponent(searchQuery)}&limit=20`
      );
      return response.users || [];
    },
    enabled: searchQuery.length >= 2, // Only search when at least 2 characters
    staleTime: 30000,
  });

  const createDirectMessage = useMutation({
    mutationFn: async (recipientId: string) => {
      const response = await apiClient.post<{ room: { id: string; name: string } }>(
        '/api/direct-message',
        { recipientId }
      );
      return response.room;
    },
    onSuccess: async (room) => {
      await queryClient.invalidateQueries({ queryKey: ['chat', 'rooms'] });
      await queryClient.refetchQueries({ queryKey: ['chat', 'rooms'] });
      // Navigate to the chat room
      navigation.navigate('ChatRoom' as never, {
        roomId: room.id,
        name: room.name,
      } as never);
    },
  });

  const handleStartChat = (user: User) => {
    createDirectMessage.mutate(user.id);
  };

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
            <Text style={styles.headerTitle}>New Message</Text>
            <Text style={styles.headerSubtitle}>Search for a user to message</Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Search Input */}
          <View style={styles.searchContainer}>
            <GlassCard style={styles.searchCard}>
              <View style={styles.searchInputContainer}>
                <Ionicons name="search" size={20} color={colors.pineBlue[300]} />
                <TextInput
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholder="Search by name or email..."
                  placeholderTextColor={colors.pineBlue[300]}
                  style={styles.searchInput}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {searchQuery.length > 0 && (
                  <Pressable onPress={() => setSearchQuery('')} style={styles.clearButton}>
                    <Ionicons name="close-circle" size={20} color={colors.pineBlue[300]} />
                  </Pressable>
                )}
              </View>
            </GlassCard>
          </View>

          {/* Loading State */}
          {isLoading && searchQuery.length >= 2 && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Searching...</Text>
            </View>
          )}

          {/* Users List */}
          {!isLoading && users && users.length > 0 && (
            <View style={styles.usersContainer}>
              {users.map((user) => (
                <GlassCard key={user.id} style={styles.userCard}>
                  <Pressable
                    onPress={() => handleStartChat(user)}
                    disabled={createDirectMessage.isPending}
                    style={styles.userPressable}
                  >
                    <View style={styles.userContent}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {user.name?.[0]?.toUpperCase() || 'U'}
                        </Text>
                      </View>
                      <View style={styles.userInfo}>
                        <Text style={styles.userName}>{user.name || 'Unknown'}</Text>
                        <Text style={styles.userEmail}>{user.email}</Text>
                      </View>
                      {createDirectMessage.isPending ? (
                        <ActivityIndicator size="small" color={colors.evergreen[500]} />
                      ) : (
                        <Ionicons
                          name="chatbubble-outline"
                          size={24}
                          color={colors.evergreen[500]}
                        />
                      )}
                    </View>
                  </Pressable>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading &&
            searchQuery.length >= 2 &&
            users &&
            users.length === 0 && (
              <EmptyState
                icon="person-outline"
                title="No users found"
                message={`No users match "${searchQuery}". Try a different search term.`}
              />
            )}

          {/* Initial State */}
          {searchQuery.length < 2 && (
            <View style={styles.initialContainer}>
              <Ionicons name="search-outline" size={48} color={colors.pineBlue[300]} />
              <Text style={styles.initialText}>
                Start typing to search for users
              </Text>
              <Text style={styles.initialSubtext}>
                Search by name or email address
              </Text>
            </View>
          )}
        </ScrollView>
      </LinearGradient>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.darkTeal[950],
  },
  gradient: {
    flex: 1,
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
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  searchCard: {
    padding: spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  searchInput: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    flex: 1,
  },
  clearButton: {
    padding: spacing.xs,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: spacing['2xl'],
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    marginTop: spacing.md,
  },
  usersContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  userCard: {
    marginBottom: spacing.md,
    padding: spacing.md,
  },
  userPressable: {
    width: '100%',
  },
  userContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.headingMd,
    fontSize: 20,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  userInfo: {
    flex: 1,
  },
  userName: {
    ...typography.headingMd,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: 2,
  },
  userEmail: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
  },
  initialContainer: {
    alignItems: 'center',
    paddingVertical: spacing['3xl'],
    paddingHorizontal: spacing.xl,
  },
  initialText: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    marginTop: spacing.lg,
    marginBottom: spacing.xs,
  },
  initialSubtext: {
    ...typography.bodyMd,
    color: colors.pineBlue[300],
    textAlign: 'center',
  },
});

export default UserSearchScreen;

