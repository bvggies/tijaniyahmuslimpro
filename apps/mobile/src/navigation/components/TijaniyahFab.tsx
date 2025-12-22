import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { TijaniyahSheet } from './TijaniyahSheet';

export const TijaniyahFab: React.FC = () => {
  const [sheetVisible, setSheetVisible] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Subtle pulse animation: scale 1 → 1.03 → 1 every 3.5 seconds
    const pulse = Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 1.03,
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(pulseAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
    ]);

    const loop = Animated.loop(pulse);
    loop.start();

    return () => loop.stop();
  }, [pulseAnim]);

  return (
    <>
      <View style={styles.container} pointerEvents="box-none">
        {/* Soft radial glow behind FAB */}
        <View style={styles.radialGlow} />
        
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <Pressable
            onPress={() => setSheetVisible(true)}
            style={({ pressed }) => [
              styles.fab,
              pressed && styles.fabPressed,
            ]}
          >
            <View style={styles.glowRing} />
            {/* Faint Islamic star/rosette watermark */}
            <View style={styles.starWatermark}>
              <Svg width={40} height={40} viewBox="0 0 40 40" style={styles.starSvg}>
                <Path
                  d="M20 4 L22 14 L32 16 L22 18 L20 28 L18 18 L8 16 L18 14 Z"
                  fill={colors.evergreen[500]}
                  opacity={0.06}
                />
              </Svg>
            </View>
            <Ionicons name="sparkles" size={28} color={colors.evergreen[500]} />
          </Pressable>
        </Animated.View>
        <Text style={styles.label}>Tijaniyah</Text>
      </View>
      <TijaniyahSheet visible={sheetVisible} onClose={() => setSheetVisible(false)} />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 20 + 33 : 14 + 33, // Reduced by 4px for better anchoring
    alignSelf: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  radialGlow: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(8, 247, 116, 0.12)', // Soft radial glow at 12% opacity
    zIndex: -2,
  },
  fab: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.darkTeal[800],
    borderWidth: 2,
    borderColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.evergreen[500],
    shadowOpacity: 0.4,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    marginBottom: 4,
    overflow: 'hidden',
  },
  fabPressed: {
    transform: [{ scale: 0.97 }],
    opacity: 0.9,
  },
  glowRing: {
    position: 'absolute',
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(8, 247, 116, 0.18)',
    zIndex: -1,
  },
  starWatermark: {
    position: 'absolute',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.06,
  },
  starSvg: {
    position: 'absolute',
  },
  label: {
    fontSize: 10,
    color: colors.evergreen[500],
    fontWeight: '600',
    marginTop: 2,
  },
});

