import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors } from '../../theme/colors';

type GlassCardProps = {
  children: React.ReactNode;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  intensity?: number;
};

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  onPress,
  style,
  intensity = 35,
}) => {
  const content = (
    <BlurView intensity={intensity} tint="light" style={styles.blur}>
      <View style={styles.inner}>{children}</View>
    </BlurView>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.container,
          style,
          pressed && { transform: [{ scale: 0.97 }], opacity: 0.9 },
        ]}
      >
        {content}
      </Pressable>
    );
  }

  return <View style={[styles.container, style]}>{content}</View>;
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    backgroundColor: colors.darkTeal[800], // Primary card surface
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  blur: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.06)', // Glass overlay
  },
  inner: {
    padding: 16,
  },
});

export default GlassCard;


