import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Pressable,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrentUser } from '../../hooks/useAuth';
import { useUpdateProfile } from '../../hooks/useAuth';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';

export const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { data: currentUser, isLoading } = useCurrentUser();
  const updateProfile = useUpdateProfile();
  
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form when user data loads
  React.useEffect(() => {
    if (currentUser) {
      setName(currentUser.name || '');
      setEmail(currentUser.email || '');
    }
  }, [currentUser]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert('Validation Error', 'Name is required');
      return;
    }

    if (!email.trim()) {
      Alert.alert('Validation Error', 'Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    try {
      await updateProfile.mutateAsync({
        name: name.trim(),
        email: email.trim(),
      });
      Alert.alert('Success', 'Profile updated successfully', [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error?.response?.data?.error || error?.message || 'Failed to update profile';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <LinearGradient
          colors={[colors.darkTeal[950], colors.darkTeal[900]]}
          style={styles.gradient}
        >
          <View style={styles.container}>
            <Skeleton width="100%" height={60} style={{ marginBottom: spacing.lg }} />
            <Skeleton width="100%" height={200} />
          </View>
        </LinearGradient>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Header */}
            <View style={styles.header}>
              <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
              </Pressable>
              <Text style={styles.headerTitle}>Edit Profile</Text>
              <View style={styles.headerSpacer} />
            </View>

            {/* Profile Info Card */}
            <GlassCard style={styles.profileCard}>
              <View style={styles.avatarSection}>
                <View style={styles.avatar}>
                  <Ionicons name="person" size={40} color={colors.evergreen[500]} />
                </View>
                <Text style={styles.avatarHint}>Profile picture coming soon</Text>
              </View>

              <View style={styles.formSection}>
                <Text style={styles.label}>Name</Text>
                <Input
                  value={name}
                  onChangeText={setName}
                  placeholder="Enter your name"
                  autoCapitalize="words"
                  style={styles.input}
                />

                <Text style={styles.label}>Email</Text>
                <Input
                  value={email}
                  onChangeText={setEmail}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={styles.input}
                />
              </View>
            </GlassCard>

            {/* Save Button */}
            <View style={styles.buttonSection}>
              <Button
                label={isSubmitting ? 'Saving...' : 'Save Changes'}
                onPress={handleSave}
                variant="primary"
                disabled={isSubmitting}
                style={styles.saveButton}
              />
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  keyboardView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing['2xl'],
  },
  container: {
    flex: 1,
    padding: spacing.lg,
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
  headerSpacer: {
    width: 40,
  },
  profileCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    padding: spacing.lg,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 3,
    borderColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  avatarHint: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    fontSize: 11,
  },
  formSection: {
    gap: spacing.md,
  },
  label: {
    ...typography.bodyMd,
    color: colors.white,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  input: {
    marginBottom: spacing.sm,
  },
  buttonSection: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  saveButton: {
    width: '100%',
  },
});

export default EditProfileScreen;

