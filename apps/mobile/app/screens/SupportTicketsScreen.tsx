import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as SecureStore from 'expo-secure-store';
import { colors } from '../../src/theme/colors';
import { spacing } from '../../src/theme/spacing';
import { typography } from '../../src/theme/typography';
import { GlassCard } from '../../src/components/ui/GlassCard';
import { IslamicPattern } from '../../src/components/ui/IslamicPattern';
import { Button } from '../../src/components/ui/Button';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? 'https://tijaniyahmuslimpro-admin-mu.vercel.app';

interface TicketDto {
  id: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
}

export const SupportTicketsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['supportTickets'],
    queryFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/support-tickets`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      if (!res.ok) throw new Error('Failed to load tickets');
      return (await res.json()) as { tickets: TicketDto[] };
    },
  });

  const createTicket = useMutation({
    mutationFn: async () => {
      const token = await SecureStore.getItemAsync('accessToken');
      const res = await fetch(`${API_BASE_URL}/api/support-tickets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ subject, message }),
      });
      if (!res.ok) throw new Error('Failed to create ticket');
      return res.json();
    },
    onSuccess: () => {
      setSubject('');
      setMessage('');
      setShowNewTicket(false);
      void queryClient.invalidateQueries({ queryKey: ['supportTickets'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return colors.evergreen[500];
      case 'in_progress':
        return colors.pineBlue[300];
      case 'resolved':
        return colors.evergreen[500];
      case 'closed':
        return colors.pineBlue[300];
      default:
        return colors.pineBlue[300];
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Open';
      case 'in_progress':
        return 'In Progress';
      case 'resolved':
        return 'Resolved';
      case 'closed':
        return 'Closed';
      default:
        return status;
    }
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
            <Text style={styles.headerTitle}>Support Tickets</Text>
            <Text style={styles.headerSubtitle}>Get Help & Support</Text>
          </View>
          <Pressable
            onPress={() => setShowNewTicket(!showNewTicket)}
            style={styles.addButton}
          >
            <Ionicons
              name={showNewTicket ? 'close' : 'add'}
              size={24}
              color={colors.pineBlue[100]}
            />
          </Pressable>
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* New Ticket Form */}
          {showNewTicket && (
            <GlassCard style={styles.newTicketCard}>
              <Text style={styles.newTicketTitle}>Create New Ticket</Text>
              <TextInput
                value={subject}
                onChangeText={setSubject}
                placeholder="Subject"
                placeholderTextColor={colors.pineBlue[300]}
                style={styles.input}
              />
              <TextInput
                value={message}
                onChangeText={setMessage}
                placeholder="Describe your issue or question..."
                placeholderTextColor={colors.pineBlue[300]}
                multiline
                style={[styles.input, styles.messageInput]}
                textAlignVertical="top"
              />
              <Button
                label={createTicket.isPending ? 'Creating...' : 'Create Ticket'}
                onPress={() => createTicket.mutate()}
                variant="primary"
                disabled={!subject.trim() || !message.trim() || createTicket.isPending}
                style={styles.createButton}
              />
            </GlassCard>
          )}

          {/* Info Card */}
          <GlassCard style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="help-circle" size={24} color={colors.evergreen[500]} />
              <View style={styles.infoText}>
                <Text style={styles.infoTitle}>Support & Help</Text>
                <Text style={styles.infoDescription}>
                  Create a support ticket for any issues, questions, or feedback. Our team will respond as soon as possible.
                </Text>
              </View>
            </View>
          </GlassCard>

          {/* Loading State */}
          {isLoading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.evergreen[500]} />
              <Text style={styles.loadingText}>Loading tickets...</Text>
            </View>
          )}

          {/* Tickets List */}
          {data?.tickets && data.tickets.length > 0 && (
            <View style={styles.ticketsList}>
              <Text style={styles.sectionTitle}>Your Tickets</Text>
              {data.tickets.map((ticket) => (
                <GlassCard key={ticket.id} style={styles.ticketCard}>
                  <View style={styles.ticketHeader}>
                    <View style={styles.ticketInfo}>
                      <Text style={styles.ticketSubject}>{ticket.subject}</Text>
                      <Text style={styles.ticketDate}>
                        {new Date(ticket.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(ticket.status) + '20' },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(ticket.status) },
                        ]}
                      >
                        {getStatusLabel(ticket.status)}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.ticketMessage} numberOfLines={2}>
                    {ticket.message}
                  </Text>
                </GlassCard>
              ))}
            </View>
          )}

          {/* Empty State */}
          {!isLoading && (!data?.tickets || data.tickets.length === 0) && (
            <GlassCard style={styles.emptyCard}>
              <View style={styles.emptyContent}>
                <Ionicons name="ticket-outline" size={48} color={colors.pineBlue[300]} />
                <Text style={styles.emptyTitle}>No Tickets Yet</Text>
                <Text style={styles.emptyMessage}>
                  Create a support ticket to get help with any issues or questions.
                </Text>
              </View>
            </GlassCard>
          )}

          <View style={styles.footer} />
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
  addButton: {
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
    paddingBottom: spacing['2xl'],
  },
  newTicketCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  newTicketTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  input: {
    ...typography.bodyMd,
    color: colors.white,
    padding: spacing.md,
    backgroundColor: colors.darkTeal[800],
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    marginBottom: spacing.md,
  },
  messageInput: {
    minHeight: 120,
  },
  createButton: {
    width: '100%',
  },
  infoCard: {
    marginBottom: spacing.xl,
    padding: spacing.lg,
  },
  infoRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  infoText: {
    flex: 1,
  },
  infoTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.xs,
  },
  infoDescription: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
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
  ticketsList: {
    marginTop: spacing.lg,
  },
  sectionTitle: {
    ...typography.headingLg,
    fontSize: 18,
    color: colors.white,
    fontWeight: '700',
    marginBottom: spacing.md,
  },
  ticketCard: {
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  ticketHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
  },
  ticketInfo: {
    flex: 1,
  },
  ticketSubject: {
    ...typography.headingLg,
    fontSize: 16,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  ticketDate: {
    ...typography.bodySm,
    fontSize: 11,
    color: colors.pineBlue[300],
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 12,
  },
  statusText: {
    ...typography.bodySm,
    fontSize: 11,
    fontWeight: '600',
  },
  ticketMessage: {
    ...typography.bodySm,
    color: colors.pineBlue[100],
    lineHeight: 20,
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
});
