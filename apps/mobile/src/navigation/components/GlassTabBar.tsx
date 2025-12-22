import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { colors } from '../../theme/colors';

export const GlassTabBar: React.FC<BottomTabBarProps> = ({ state, descriptors, navigation }) => {
  return (
    <View pointerEvents="box-none" style={styles.outer}>
      <BlurView intensity={40} tint="dark" style={styles.bar}>
        {/* Very faint Islamic geometric pattern watermark */}
        <View style={styles.patternOverlay} pointerEvents="none">
          <Svg width="100%" height="100%" viewBox="0 0 200 74" style={styles.patternSvg}>
            <Path
              d="M20 20 L30 20 L30 30 L20 30 Z M50 20 L60 20 L60 30 L50 30 Z M80 20 L90 20 L90 30 L80 30 Z M110 20 L120 20 L120 30 L110 30 Z M150 20 L160 20 L160 30 L150 30 Z"
              fill={colors.evergreen[500]}
              opacity={0.03}
            />
            <Path
              d="M35 35 L40 30 L45 35 L40 40 Z M65 35 L70 30 L75 35 L70 40 Z M95 35 L100 30 L105 35 L100 40 Z M125 35 L130 30 L135 35 L130 40 Z M165 35 L170 30 L175 35 L170 40 Z"
              fill={colors.evergreen[500]}
              opacity={0.04}
            />
          </Svg>
        </View>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const getIconName = (routeName: string): string => {
            switch (routeName) {
              case 'HomeTab':
                return 'home-outline';
              case 'PrayerTab':
                return 'time-outline';
              case 'QuranTab':
                return 'book-outline';
              case 'CommunityTab':
                return 'people-outline';
              case 'ProfileTab':
              default:
                return 'person-outline';
            }
          };

          const iconName = getIconName(route.name);

          return (
            <React.Fragment key={route.key}>
              {index === 2 && <View style={styles.fabSpacer} />}
              <TouchableOpacity
                key={route.key}
                accessibilityRole="button"
                accessibilityState={isFocused ? { selected: true } : {}}
                onPress={onPress}
                style={styles.tab}
                activeOpacity={0.8}
              >
                <View style={styles.iconWrapper}>
                  {/* Soft halo under active icon */}
                  {isFocused && (
                    <View style={styles.activeHalo} />
                  )}
                  <Ionicons
                    name={iconName as any}
                    size={22}
                    color={isFocused ? colors.evergreen[500] : colors.pineBlue[300]}
                    style={{ opacity: isFocused ? 1 : 0.68 }}
                  />
                </View>
                <Text
                  style={[
                    styles.label,
                    isFocused && styles.labelActive,
                    !isFocused && styles.labelInactive,
                  ]}
                >
                  {String(label).replace('Tab', '')}
                </Text>
                {isFocused ? <View style={styles.activeUnderline} /> : <View style={styles.inactiveSpacer} />}
              </TouchableOpacity>
            </React.Fragment>
          );
        })}
      </BlurView>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: Platform.OS === 'ios' ? 20 : 14,
  },
  bar: {
    flexDirection: 'row',
    height: 74,
    borderRadius: 28,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(6, 28, 30, 0.55)', // Dark glass with dark-teal tint
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'space-around',
    overflow: 'hidden',
    position: 'relative',
  },
  patternOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.03,
  },
  patternSvg: {
    position: 'absolute',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 60,
  },
  fabSpacer: {
    width: 64, // Space for FAB
  },
  iconWrapper: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 2,
    position: 'relative',
  },
  activeHalo: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(8, 247, 116, 0.15)', // Soft halo under active icon
    zIndex: -1,
  },
  label: {
    fontSize: 11.5,
    marginTop: 2,
    letterSpacing: 0.3,
  },
  labelActive: {
    color: colors.evergreen[500],
    fontWeight: '600',
    opacity: 1,
  },
  labelInactive: {
    color: colors.pineBlue[300],
    opacity: 0.68, // Reduced opacity for inactive tabs
  },
  activeUnderline: {
    marginTop: 4,
    width: 10,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: 'rgba(8, 247, 116, 0.7)', // Glowing underline with reduced intensity
  },
  inactiveSpacer: {
    marginTop: 4,
    width: 6,
    height: 6,
  },
});

