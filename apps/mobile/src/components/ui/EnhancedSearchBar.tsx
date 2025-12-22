import React from 'react';
import { View, TextInput, StyleSheet, Pressable, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';
import { GlassCard } from './GlassCard';

interface EnhancedSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmit?: () => void;
  autoFocus?: boolean;
  showIcon?: boolean;
}

export const EnhancedSearchBar: React.FC<EnhancedSearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search the app...',
  onFocus,
  onBlur,
  onSubmit,
  autoFocus = false,
  showIcon = true,
}) => {
  const [isFocused, setIsFocused] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const handleFocus = () => {
    setIsFocused(true);
    Animated.spring(scaleAnim, {
      toValue: 1.02,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
    onFocus?.();
  };

  const handleBlur = () => {
    setIsFocused(false);
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      tension: 100,
      friction: 7,
    }).start();
    onBlur?.();
  };

  return (
    <Animated.View style={[styles.container, { transform: [{ scale: scaleAnim }] }]}>
      <GlassCard style={[styles.searchCard, isFocused && styles.searchCardFocused]}>
        <View style={styles.innerContainer}>
          {showIcon && (
            <Ionicons
              name="search-outline"
              size={20}
              color={isFocused ? colors.evergreen[500] : colors.pineBlue[300]}
              style={styles.icon}
            />
          )}
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor={colors.pineBlue[300]}
            value={value}
            onChangeText={onChangeText}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onSubmitEditing={onSubmit}
            autoFocus={autoFocus}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {value.length > 0 && (
            <Pressable onPress={() => onChangeText('')} style={styles.clearButton}>
              <Ionicons name="close-circle" size={20} color={colors.pineBlue[300]} />
            </Pressable>
          )}
        </View>
      </GlassCard>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.md,
  },
  searchCard: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    minHeight: 56,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    backgroundColor: 'rgba(16, 80, 86, 0.6)',
  },
  searchCardFocused: {
    borderColor: 'rgba(8, 247, 116, 0.3)',
    backgroundColor: 'rgba(16, 80, 86, 0.8)',
    shadowColor: colors.evergreen[500],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    ...typography.bodyMd,
    fontSize: 16,
    color: colors.white,
    paddingVertical: spacing.sm,
    minHeight: 48,
  },
  clearButton: {
    padding: spacing.xs,
    marginLeft: spacing.xs,
  },
});

export default EnhancedSearchBar;

