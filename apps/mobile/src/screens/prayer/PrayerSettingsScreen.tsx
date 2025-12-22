import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from '../../components/ui/GlassCard';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import * as SecureStore from 'expo-secure-store';
import { locationService } from '../../services/locationService';

const LOCATION_OVERRIDE_KEY = 'prayer_location_override';

const CALCULATION_METHODS = [
  { id: '1', name: 'Muslim World League', value: 3 },
  { id: '2', name: 'Islamic Society of North America', value: 2 },
  { id: '3', name: 'Egyptian General Authority', value: 5 },
  { id: '4', name: 'Umm al-Qura University', value: 4 },
  { id: '5', name: 'University of Islamic Sciences', value: 1 },
];

export const PrayerSettingsScreen: React.FC = () => {
  const navigation = useNavigation();
  const [method, setMethod] = useState('1');
  const [fajrOffset, setFajrOffset] = useState('0');
  const [maghribOffset, setMaghribOffset] = useState('0');
  const [locationLabel, setLocationLabel] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');

  const handleUseCurrentLocation = async () => {
    try {
      const loc = await locationService.getCurrentLocation();
      setLat(loc.lat.toFixed(4));
      setLng(loc.lng.toFixed(4));
      setLocationLabel(loc.city && loc.country ? `${loc.city}, ${loc.country}` : loc.address || 'Current location');
    } catch (err) {
      Alert.alert('Location error', (err as Error).message || 'Unable to get location');
    }
  };

  const handleSaveLocationOverride = async () => {
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!lat || !lng || Number.isNaN(latNum) || Number.isNaN(lngNum)) {
      Alert.alert('Invalid coordinates', 'Please enter a valid latitude and longitude.');
      return;
    }
    await SecureStore.setItemAsync(
      LOCATION_OVERRIDE_KEY,
      JSON.stringify({ lat: latNum, lng: lngNum, label: locationLabel || 'Custom location' }),
    );
    Alert.alert('Saved', 'Prayer location override has been saved.');
  };

  const handleResetLocationOverride = async () => {
    await SecureStore.deleteItemAsync(LOCATION_OVERRIDE_KEY);
    setLocationLabel('');
    setLat('');
    setLng('');
    Alert.alert('Reset', 'Using automatic GPS-based location again.');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[colors.darkTeal[950], colors.darkTeal[900]]}
        style={styles.gradient}
      >
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color={colors.pineBlue[100]} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Prayer Settings</Text>
            <View style={styles.placeholder} />
          </View>

          {/* Calculation Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Calculation Method</Text>
            {CALCULATION_METHODS.map((m) => (
              <TouchableOpacity
                key={m.id}
                onPress={() => setMethod(m.id)}
                style={styles.methodCard}
              >
                <GlassCard style={styles.methodCardInner}>
                  <View style={styles.methodRow}>
                    <Text style={styles.methodName}>{m.name}</Text>
                    {method === m.id && (
                      <Ionicons name="checkmark-circle" size={24} color={colors.evergreen[500]} />
                    )}
                  </View>
                </GlassCard>
              </TouchableOpacity>
            ))}
          </View>

          {/* Offsets */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Time Adjustments (minutes)</Text>
            <Input
              label="Fajr Offset"
              value={fajrOffset}
              onChangeText={setFajrOffset}
              keyboardType="numeric"
              placeholder="0"
            />
            <Input
              label="Maghrib Offset"
              value={maghribOffset}
              onChangeText={setMaghribOffset}
              keyboardType="numeric"
              placeholder="0"
            />
          </View>

          {/* Location Override */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location Override</Text>
            <Text style={styles.sectionSubtitle}>
              Optionally set a fixed location for prayer times instead of using GPS.
            </Text>
            <Input
              label="Location label"
              value={locationLabel}
              onChangeText={setLocationLabel}
              placeholder="e.g. Lagos, Nigeria"
            />
            <Input
              label="Latitude"
              value={lat}
              onChangeText={setLat}
              keyboardType="numeric"
              placeholder="e.g. 6.5244"
            />
            <Input
              label="Longitude"
              value={lng}
              onChangeText={setLng}
              keyboardType="numeric"
              placeholder="e.g. 3.3792"
            />
            <View style={styles.locationButtonsRow}>
              <Button
                label="Use current location"
                onPress={handleUseCurrentLocation}
                variant="secondary"
                style={styles.locationButton}
              />
              <Button
                label="Reset"
                onPress={handleResetLocationOverride}
                variant="outline"
                style={styles.locationButton}
              />
            </View>
          </View>

          {/* Save Button */}
          <Button
            label="Save Settings"
            onPress={() => {
              navigation.goBack();
            }}
            variant="primary"
            style={styles.saveButton}
          />
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
  scrollView: {
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
  section: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.headingMd,
    color: colors.white,
    marginBottom: spacing.md,
    fontWeight: '600',
  },
  sectionSubtitle: {
    ...typography.bodySm,
    color: colors.pineBlue[300],
    marginBottom: spacing.md,
  },
  methodCard: {
    marginBottom: spacing.md,
  },
  methodCardInner: {
    padding: spacing.lg,
  },
  methodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  methodName: {
    ...typography.bodyMd,
    color: colors.white,
    flex: 1,
  },
  locationButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
    gap: spacing.sm,
  },
  locationButton: {
    flex: 1,
  },
  saveButton: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing['2xl'],
  },
});

export default PrayerSettingsScreen;

