import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Animated,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePosts, useCreatePost, useLikePost } from '../../hooks/useCommunity';
import { useIsGuest } from '../../hooks/useGuest';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { navigateToAuth } from '../../utils/navigation';

export const CommunityFeedScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: posts, isLoading, error, refetch } = usePosts();
  const { data: isGuest } = useIsGuest();
  const createPost = useCreatePost();
  const likePost = useLikePost();
  const [composer, setComposer] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreatePost = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to share posts with the community.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              navigateToAuth(navigation);
            },
          },
        ],
      );
      return;
    }

    if (!composer.trim()) return;

    try {
      await createPost.mutateAsync(composer);
      setComposer('');
      // Scroll to top to show the new post (optimistic update is already visible)
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    } catch (err: any) {
      // Show the actual error message from the API or a user-friendly fallback
      const errorMessage = err?.message || 'Failed to create post. Please try again.';
      Alert.alert('Error', errorMessage);
    }
  };

  const handleLike = async (postId: string) => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to like posts.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Sign In',
            onPress: () => {
              navigateToAuth(navigation);
            },
          },
        ],
      );
      return;
    }

    try {
      await likePost.mutateAsync(postId);
    } catch (err) {
      Alert.alert('Error', 'Failed to like post. Please try again.');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
          <Text style={styles.headerTitle}>Community</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('ChatRooms' as never)}
            style={styles.chatButton}
          >
            <Ionicons name="chatbubbles-outline" size={24} color={colors.evergreen[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={colors.evergreen[500]}
            />
          }
        >
          {/* Post Composer */}
          <View style={styles.composerContainer}>
            <GlassCard style={styles.composerCard}>
              <TextInput
                value={composer}
                onChangeText={setComposer}
                placeholder={isGuest ? 'Sign in to share...' : 'Share a reflection or dua…'}
                placeholderTextColor={colors.pineBlue[300]}
                multiline
                style={styles.composerInput}
                editable={!isGuest}
              />
              {isGuest && (
                <View style={styles.guestOverlay}>
                  <Ionicons name="lock-closed" size={16} color={colors.pineBlue[300]} />
                  <Text style={styles.guestText}>Sign in to post</Text>
                </View>
              )}
              <Button
                label={createPost.isPending ? 'Posting...' : 'Post'}
                onPress={handleCreatePost}
                variant="primary"
                disabled={!composer.trim() || createPost.isPending || isGuest}
                style={styles.postButton}
              />
            </GlassCard>
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <GlassCard style={styles.errorCard}>
                <Ionicons name="alert-circle" size={24} color={colors.evergreen[500]} />
                <Text style={styles.errorTitle}>Failed to load posts</Text>
                <Text style={styles.errorText}>
                  {error.message || 'Unable to connect to the server. Please check your connection and try again.'}
                </Text>
                <View style={styles.errorActions}>
                  <Button
                    label="Retry"
                    onPress={() => refetch()}
                    variant="primary"
                    style={styles.retryButton}
                  />
                  <Button
                    label="Pull to refresh"
                    onPress={handleRefresh}
                    variant="outline"
                    style={styles.retryButton}
                  />
                </View>
              </GlassCard>
            </View>
          )}

          {/* Loading State */}
          {isLoading && !posts && (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={150} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          )}

          {/* Posts List */}
          {!isLoading && posts && posts.length > 0 && (
            <View style={styles.postsContainer}>
              {posts.map((post) => (
                    <GlassCard key={post.id} style={styles.postCard}>
                      <View style={styles.postHeader}>
                        <View style={styles.authorInfo}>
                          <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                              {post.author.name?.[0]?.toUpperCase() || 'U'}
                            </Text>
                          </View>
                          <View>
                            <Text style={styles.authorName}>
                              {post.author.name || 'Anonymous'}
                            </Text>
                            <Text style={styles.postTime}>{formatTime(post.createdAt)}</Text>
                          </View>
                        </View>
                      </View>

                      <Text style={styles.postContent}>{post.content}</Text>

                      <View style={styles.postActions}>
                        <TouchableOpacity
                          onPress={() => handleLike(post.id)}
                          style={styles.actionButton}
                          disabled={likePost.isPending}
                        >
                          <Ionicons
                            name={post.isLiked ? 'heart' : 'heart-outline'}
                            size={20}
                            color={post.isLiked ? colors.evergreen[500] : colors.pineBlue[300]}
                          />
                          <Text
                            style={[
                              styles.actionText,
                              post.isLiked && { color: colors.evergreen[500] },
                            ]}
                          >
                            {post.likes}
                          </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => {
                            // Navigate to post details/comments
                            navigation.navigate('PostDetails' as never, { postId: post.id } as never);
                          }}
                        >
                          <Ionicons name="chatbubble-outline" size={20} color={colors.pineBlue[300]} />
                          <Text style={styles.actionText}>{post.comments}</Text>
                        </TouchableOpacity>
                      </View>
                    </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!posts || posts.length === 0) && (
            <EmptyState
              icon="people-outline"
              title="No posts yet"
              message="Be the first to share a gentle reminder with the community"
              actionLabel={isGuest ? 'Sign in to post' : 'Create a post'}
              onAction={isGuest ? () => navigateToAuth(navigation) : handleCreatePost}
            />
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
  headerTitle: {
    ...typography.headingLg,
    fontSize: 28,
    color: colors.white,
    fontWeight: '700',
  },
  chatButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  composerContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  composerCard: {
    padding: spacing.md,
  },
  composerInput: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  guestOverlay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  guestText: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 12,
  },
  postButton: {
    alignSelf: 'flex-end',
  },
  errorContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  errorCard: {
    padding: spacing.lg,
    alignItems: 'center',
  },
  errorTitle: {
    ...typography.headingSm,
    color: colors.white,
    fontWeight: '600',
    marginTop: spacing.sm,
    marginBottom: spacing.xs,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 20,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    width: '100%',
  },
  retryButton: {
    flex: 1,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
  },
  postsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  postCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  authorName: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
  },
  postTime: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  postContent: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  postActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 14,
  },
});

export default CommunityFeedScreen;

