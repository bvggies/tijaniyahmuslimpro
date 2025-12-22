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
import { useChatRooms, type ChatRoom } from '../../hooks/useChat';
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
import apiClient from '../../services/apiClient';
import { useMutation, useQueryClient } from '@tanstack/react-query';

export const ChatRoomsScreen: React.FC = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { data: rooms, isLoading, error, refetch } = useChatRooms();
  const { data: isGuest } = useIsGuest();
  const [roomName, setRoomName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const createRoom = useMutation({
    mutationFn: async (name: string) => {
      const response = await apiClient.post<{ room: ChatRoom }>('/api/chat-rooms', {
        name,
        isGroup: true,
      });
      return response;
    },
    onSuccess: async (data) => {
      setRoomName('');
      // Optimistically add the new room to the cache immediately
      if (data?.room) {
        const newRoomId = data.room.id;
        queryClient.setQueryData<ChatRoom[]>(['chat', 'rooms'], (old = []) => {
          // Check if room already exists to avoid duplicates
          const exists = old.some((r) => r.id === newRoomId);
          if (exists) return old;
          return [data.room, ...old];
        });
        
        // Don't refetch immediately - let the optimistic update persist
        // The next natural refetch (on mount, pull-to-refresh, or when app comes to foreground) will sync with server
        // This prevents the room from disappearing due to timing issues
      }
    },
    onError: (error) => {
      console.error('Create room error:', error);
      Alert.alert('Error', 'Failed to create room. Please try again.');
    },
  });

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleCreateRoom = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to create chat rooms.',
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

    if (!roomName.trim()) return;

    try {
      await createRoom.mutateAsync(roomName);
    } catch (err) {
      Alert.alert('Error', 'Failed to create room. Please try again.');
    }
  };

  const formatLastMessage = (timestamp?: string) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
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
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chat Rooms</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate('UserSearch' as never)}
            style={styles.newMessageButton}
          >
            <Ionicons name="person-add-outline" size={24} color={colors.evergreen[500]} />
          </TouchableOpacity>
        </View>

        <ScrollView
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
          {/* Create Room */}
          <View style={styles.createContainer}>
            <GlassCard style={styles.createCard}>
              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder={isGuest ? 'Sign in to create room...' : 'New room name'}
                placeholderTextColor={colors.pineBlue[300]}
                style={styles.createInput}
                editable={!isGuest}
              />
              {isGuest && (
                <View style={styles.guestOverlay}>
                  <Ionicons name="lock-closed" size={16} color={colors.pineBlue[300]} />
                  <Text style={styles.guestText}>Sign in to create rooms</Text>
                </View>
              )}
              <Button
                label={createRoom.isPending ? 'Creating...' : 'Create Room'}
                onPress={handleCreateRoom}
                variant="primary"
                disabled={!roomName.trim() || createRoom.isPending || isGuest}
                style={styles.createButton}
              />
            </GlassCard>
          </View>

          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <GlassCard style={styles.errorCard}>
                <Ionicons name="alert-circle" size={24} color={colors.evergreen[500]} />
                <Text style={styles.errorText}>
                  Failed to load chat rooms. Pull down to refresh.
                </Text>
                <Button
                  label="Retry"
                  onPress={() => refetch()}
                  variant="outline"
                  style={styles.retryButton}
                />
              </GlassCard>
            </View>
          )}

          {/* Loading State */}
          {isLoading && !rooms && (
            <View style={styles.loadingContainer}>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} width="100%" height={80} style={{ marginBottom: spacing.md }} />
              ))}
            </View>
          )}

          {/* Rooms List */}
          {!isLoading && rooms && rooms.length > 0 && (
            <View style={styles.roomsContainer}>
              {rooms.map((room) => (
                    <GlassCard
                      style={styles.roomCard}
                      onPress={() => {
                        navigation.navigate('ChatRoom' as never, {
                          roomId: room.id,
                          name: room.name,
                        } as never);
                      }}
                    >
                      <View style={styles.roomContent}>
                        <View style={styles.roomIcon}>
                          <Ionicons
                            name={room.isGroup ? "chatbubbles" : "person"}
                            size={24}
                            color={colors.evergreen[500]}
                          />
                        </View>
                        <View style={styles.roomInfo}>
                          <Text style={styles.roomName}>
                            {room.isGroup ? room.name : room.recipient?.name || room.name}
                          </Text>
                          {room.lastMessage && (
                            <Text style={styles.lastMessage} numberOfLines={1}>
                              {room.isGroup && room.lastMessage.author
                                ? `${room.lastMessage.author.name}: `
                                : ''}
                              {room.lastMessage.content}
                            </Text>
                          )}
                          {room.lastMessage && (
                            <Text style={styles.lastMessageTime}>
                              {formatLastMessage(room.lastMessage.timestamp)}
                            </Text>
                          )}
                          {!room.isGroup && (
                            <Text style={styles.roomType}>Direct message</Text>
                          )}
                        </View>
                        {room.unreadCount > 0 && (
                          <View style={styles.unreadBadge}>
                            <Text style={styles.unreadText}>{room.unreadCount}</Text>
                          </View>
                        )}
                        <Ionicons
                          name="chevron-forward"
                          size={20}
                          color={colors.pineBlue[300]}
                        />
                      </View>
                    </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && !error && (!rooms || rooms.length === 0) && (
            <EmptyState
              icon="chatbubbles-outline"
              title="No chat rooms yet"
              message="Create a room to start a Tijaniyah-focused conversation"
              actionLabel={isGuest ? 'Sign in to create' : 'Create a room'}
              onAction={
                isGuest
                  ? () => navigateToAuth(navigation)
                  : handleCreateRoom
              }
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
  newMessageButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.darkTeal[800],
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(8, 247, 116, 0.2)',
  },
  scrollView: {
    flex: 1,
  },
  createContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  createCard: {
    padding: spacing.md,
  },
  createInput: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
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
  createButton: {
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
  errorText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    textAlign: 'center',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  retryButton: {
    marginTop: spacing.sm,
  },
  loadingContainer: {
    paddingHorizontal: spacing.lg,
  },
  roomsContainer: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing['2xl'],
  },
  roomCard: {
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  roomContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(8, 247, 116, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    ...typography.headingMd,
    fontSize: 18,
    color: colors.white,
    marginBottom: 4,
  },
  lastMessage: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: 2,
  },
  lastMessageTime: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  roomType: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
    marginTop: 2,
  },
  unreadBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.darkTeal[950],
    fontWeight: '700',
  },
});

export default ChatRoomsScreen;

