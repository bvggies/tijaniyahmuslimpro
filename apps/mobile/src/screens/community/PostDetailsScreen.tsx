import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { usePostComments } from '../../hooks/useCommunity';
import { useIsGuest } from '../../hooks/useGuest';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { EmptyState } from '../../components/ui/EmptyState';
import { navigateToAuth } from '../../utils/navigation';
import apiClient from '../../services/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const PostDetailsScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = (route.params as any) || { postId: '' };
  const { data: comments, isLoading } = usePostComments(postId);
  const { data: isGuest } = useIsGuest();
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState('');

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      return apiClient.post('/api/community-comments', { postId, content });
    },
    onSuccess: () => {
      setCommentText('');
      queryClient.invalidateQueries({ queryKey: ['community', 'posts', postId, 'comments'] });
    },
  });

  const handleAddComment = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to comment on posts.',
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

    if (!commentText.trim()) return;

    try {
      await addComment.mutateAsync(commentText);
    } catch (err) {
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Comments</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Add Comment */}
          <View style={styles.commentInputContainer}>
            <GlassCard style={styles.commentInputCard}>
              <TextInput
                value={commentText}
                onChangeText={setCommentText}
                placeholder={isGuest ? 'Sign in to comment...' : 'Add a comment…'}
                placeholderTextColor={colors.pineBlue[300]}
                multiline
                style={styles.commentInput}
                editable={!isGuest}
              />
              {isGuest && (
                <View style={styles.guestOverlay}>
                  <Ionicons name="lock-closed" size={16} color={colors.pineBlue[300]} />
                  <Text style={styles.guestText}>Sign in to comment</Text>
                </View>
              )}
              <Button
                label={addComment.isPending ? 'Posting...' : 'Post Comment'}
                onPress={handleAddComment}
                variant="primary"
                disabled={!commentText.trim() || addComment.isPending || isGuest}
                style={styles.commentButton}
              />
            </GlassCard>
          </View>

          {/* Comments List */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading comments...</Text>
            </View>
          ) : comments && comments.length > 0 ? (
            <View style={styles.commentsContainer}>
              {comments.map((comment) => (
                <GlassCard key={comment.id} style={styles.commentCard}>
                  <View style={styles.commentHeader}>
                    <View style={styles.commentAvatar}>
                      <Text style={styles.commentAvatarText}>
                        {comment.author.name?.[0]?.toUpperCase() || 'U'}
                      </Text>
                    </View>
                    <View style={styles.commentInfo}>
                      <Text style={styles.commentAuthor}>
                        {comment.author.name || 'Anonymous'}
                      </Text>
                      <Text style={styles.commentTime}>
                        {new Date(comment.createdAt).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.commentContent}>{comment.content}</Text>
                </GlassCard>
              ))}
            </View>
          ) : (
            <EmptyState
              icon="chatbubble-outline"
              title="No comments yet"
              message="Be the first to comment"
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 22,
    color: colors.white,
    fontWeight: '700',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  commentInputContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  commentInputCard: {
    padding: spacing.md,
  },
  commentInput: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    minHeight: 60,
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
  commentButton: {
    alignSelf: 'flex-end',
  },
  loadingContainer: {
    padding: spacing['2xl'],
    alignItems: 'center',
  },
  loadingText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
  },
  commentsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  commentCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  commentAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentAvatarText: {
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
  },
  commentTime: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  commentContent: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 22,
  },
});

export default PostDetailsScreen;

