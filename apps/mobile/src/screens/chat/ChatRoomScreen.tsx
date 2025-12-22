import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useChatMessages, useSendMessage } from '../../hooks/useChat';
import { useIsGuest } from '../../hooks/useGuest';
import { useCurrentUser } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { EmptyState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { IslamicPattern } from '../../components/ui/IslamicPattern';
import { navigateToAuth } from '../../utils/navigation';

export const ChatRoomScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { roomId, name } = (route.params as any) || { roomId: '', name: 'Chat' };
  const { data: messages, isLoading, error, refetch } = useChatMessages(roomId);
  const { data: isGuest } = useIsGuest();
  const sendMessage = useSendMessage();
  const [text, setText] = useState('');
  const scrollViewRef = useRef<any>(null);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (messages && messages.length > 0 && scrollViewRef.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [messages]);

  const handleSend = async () => {
    if (isGuest) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to send messages.',
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

    if (!text.trim()) return;

    try {
      await sendMessage.mutateAsync({ roomId, content: text });
      setText('');
    } catch (err) {
      Alert.alert('Error', 'Failed to send message. Please try again.');
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Get current user ID for message comparison
  const { data: currentUser } = useCurrentUser();

  // Determine if message is from current user
  const isMyMessage = (message: any) => {
    if (!currentUser) return false;
    return message.author.id === currentUser.id;
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
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
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>{name}</Text>
            <Text style={styles.headerSubtitle}>
              {messages?.length || 0} messages
            </Text>
          </View>
          <View style={styles.placeholder} />
        </View>

        {/* Messages List */}
        <KeyboardAvoidingView
          style={styles.messagesContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={100}
        >
          <ScrollView
            ref={scrollViewRef}
            style={styles.messagesScrollView}
            contentContainerStyle={styles.messagesContent}
            showsVerticalScrollIndicator={false}
          >
            {isLoading && !messages && (
              <View style={styles.loadingContainer}>
                <Skeleton width="80%" height={60} style={{ marginBottom: spacing.md }} />
                <Skeleton width="70%" height={60} style={{ alignSelf: 'flex-end' }} />
                <Skeleton width="75%" height={60} />
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <GlassCard style={styles.errorCard}>
                  <Ionicons name="alert-circle" size={24} color={colors.evergreen[500]} />
                  <Text style={styles.errorText}>
                    Failed to load messages. Please try again.
                  </Text>
                  <TouchableOpacity
                    onPress={() => refetch()}
                    style={styles.retryButton}
                  >
                    <Text style={styles.retryText}>Retry</Text>
                  </TouchableOpacity>
                </GlassCard>
              </View>
            )}

            {!isLoading && messages && messages.length > 0 && (
              <View style={styles.messagesList}>
              {messages.map((message, index) => {
                const isMine = isMyMessage(message);
                return (
                  <View
                    key={message.id}
                    style={[
                      styles.messageWrapper,
                      isMine && styles.messageWrapperMine,
                    ]}
                  >
                    <GlassCard
                      style={[
                        styles.messageBubble,
                        isMine && styles.messageBubbleMine,
                      ]}
                    >
                      {!isMine && (
                        <Text style={styles.messageAuthor}>
                          {message.author.name || 'User'}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.messageText,
                          isMine && styles.messageTextMine,
                        ]}
                      >
                        {message.content}
                      </Text>
                      <Text
                        style={[
                          styles.messageTime,
                          isMine && styles.messageTimeMine,
                        ]}
                      >
                        {formatTime(message.timestamp)}
                      </Text>
                    </GlassCard>
                  </View>
                );
              })}
            </View>
          )}

            {!isLoading && !error && (!messages || messages.length === 0) && (
              <EmptyState
                icon="chatbubble-outline"
                title="No messages yet"
                message="Start the conversation with a greeting"
              />
            )}
          </ScrollView>
        </KeyboardAvoidingView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <GlassCard style={styles.inputCard}>
            <TextInput
              value={text}
              onChangeText={setText}
              placeholder={isGuest ? 'Sign in to send messages...' : 'Type a message…'}
              placeholderTextColor={colors.pineBlue[300]}
              style={styles.input}
              multiline
              editable={!isGuest}
            />
            {isGuest && (
              <View style={styles.guestOverlay}>
                <Ionicons name="lock-closed" size={16} color={colors.pineBlue[300]} />
                <Text style={styles.guestText}>Sign in to chat</Text>
              </View>
            )}
            <TouchableOpacity
              onPress={handleSend}
              disabled={!text.trim() || sendMessage.isPending || isGuest}
              style={[
                styles.sendButton,
                (!text.trim() || sendMessage.isPending || isGuest) && styles.sendButtonDisabled,
              ]}
            >
              {sendMessage.isPending ? (
                <ActivityIndicator size="small" color={colors.darkTeal[950]} />
              ) : (
                <Ionicons name="send" size={20} color={colors.darkTeal[950]} />
              )}
            </TouchableOpacity>
          </GlassCard>
        </View>
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
    paddingBottom: spacing.md,
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
  headerCenter: {
    flex: 1,
    alignItems: 'center',
    marginHorizontal: spacing.md,
  },
  headerTitle: {
    ...typography.headingLg,
    fontSize: 20,
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
  messagesContainer: {
    flex: 1,
  },
  messagesScrollView: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: spacing.lg,
  },
  loadingContainer: {
    padding: spacing.lg,
  },
  errorContainer: {
    padding: spacing.lg,
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
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 12,
    backgroundColor: colors.evergreen[500],
  },
  retryText: {
    ...typography.bodySm,
    color: colors.darkTeal[950],
    fontWeight: '600',
  },
  messagesList: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
  messageWrapper: {
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  messageWrapperMine: {
    alignItems: 'flex-end',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
  },
  messageBubbleMine: {
    backgroundColor: colors.evergreen[500],
  },
  messageAuthor: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
    marginBottom: spacing.xs,
  },
  messageText: {
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    lineHeight: 20,
  },
  messageTextMine: {
    color: colors.darkTeal[950],
  },
  messageTime: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[300],
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  messageTimeMine: {
    color: colors.darkTeal[700],
  },
  inputContainer: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  inputCard: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: spacing.sm,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.pineBlue[100],
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  guestOverlay: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  guestText: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 11,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});

export default ChatRoomScreen;

