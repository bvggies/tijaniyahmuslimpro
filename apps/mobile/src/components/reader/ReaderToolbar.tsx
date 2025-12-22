import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type FontSize = 'small' | 'medium' | 'large';

interface ReaderToolbarProps {
  fontSize: FontSize;
  onFontSizeChange: (size: FontSize) => void;
  onSearchPress: () => void;
  onTOCPress: () => void;
  onCopyPress: () => void;
}

export const ReaderToolbar: React.FC<ReaderToolbarProps> = ({
  fontSize,
  onFontSizeChange,
  onSearchPress,
  onTOCPress,
  onCopyPress,
}) => {
  return (
    <View style={styles.container}>
      <BlurView intensity={30} style={styles.blur}>
        <View style={styles.content}>
          {/* Font Size */}
          <Pressable
            onPress={() => {
              const sizes: FontSize[] = ['small', 'medium', 'large'];
              const currentIndex = sizes.indexOf(fontSize);
              const nextIndex = (currentIndex + 1) % sizes.length;
              onFontSizeChange(sizes[nextIndex]);
            }}
            style={styles.button}
          >
            <View style={styles.fontSizeContainer}>
              <Ionicons name="text" size={16} color={colors.pineBlue[100]} />
              <Text style={styles.buttonText}>
                {fontSize === 'small' ? 'A-' : fontSize === 'medium' ? 'A' : 'A+'}
              </Text>
            </View>
          </Pressable>

          {/* Search */}
          <Pressable 
            onPress={onSearchPress} 
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Ionicons name="search" size={20} color={colors.pineBlue[100]} />
          </Pressable>

          {/* TOC */}
          <Pressable 
            onPress={onTOCPress} 
            style={({ pressed }) => [
              styles.button,
              pressed && { opacity: 0.7, transform: [{ scale: 0.95 }] },
            ]}
          >
            <Ionicons name="list" size={20} color={colors.pineBlue[100]} />
          </Pressable>

          {/* Copy */}
          <Pressable onPress={onCopyPress} style={styles.button}>
            <Ionicons name="copy-outline" size={20} color={colors.pineBlue[100]} />
          </Pressable>
        </View>
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 100,
    right: spacing.lg,
    zIndex: 1000,
  },
  blur: {
    borderRadius: 24,
    overflow: 'hidden',
    backgroundColor: 'rgba(16, 80, 86, 0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  content: {
    flexDirection: 'row',
    padding: spacing.xs,
    gap: spacing.xs,
  },
  button: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.08)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontSizeContainer: {
    alignItems: 'center',
    gap: 2,
  },
  buttonText: {
    ...typography.bodySm,
    fontSize: 10,
    color: colors.pineBlue[100],
  },
});

export default ReaderToolbar;

