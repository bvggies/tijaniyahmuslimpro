import React from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';

type QiblaNeedleProps = {
  size: number;
  rotation: Animated.AnimatedInterpolation<string>;
  isAligned?: boolean;
};

export const QiblaNeedle: React.FC<QiblaNeedleProps> = ({
  size,
  rotation,
  isAligned = false,
}) => {
  const center = size / 2;
  const needleLength = size * 0.35;
  const needleWidth = 4;

  return (
    <View style={[styles.container, { width: size, height: size }]} pointerEvents="none">
      <Animated.View
        style={[
          styles.needleContainer,
          {
            transform: [{ rotate: rotation }],
          },
        ]}
      >
        {/* Needle with gradient */}
        <View style={[styles.needle, { top: center - needleLength }]}>
          <LinearGradient
            colors={[
              isAligned ? colors.evergreen[500] : colors.evergreen[500],
              isAligned ? colors.evergreen[500] : colors.pineBlue[300],
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[
              styles.needleGradient,
              {
                width: needleWidth,
                height: needleLength,
                shadowColor: isAligned ? colors.evergreen[500] : 'transparent',
                shadowOpacity: isAligned ? 0.8 : 0,
                shadowRadius: isAligned ? 12 : 0,
                shadowOffset: { width: 0, height: 0 },
              },
            ]}
          >
            {/* Arrow head */}
            <View style={styles.arrowHead}>
              <Ionicons
                name="arrow-up"
                size={20}
                color={colors.darkTeal[950]}
                style={styles.arrowIcon}
              />
            </View>
          </LinearGradient>
        </View>

        {/* Tail indicator */}
        <View
          style={[
            styles.needleTail,
            {
              top: center + 8,
              backgroundColor: isAligned ? colors.evergreen[500] : colors.pineBlue[300],
              opacity: 0.6,
            },
          ]}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  needle: {
    position: 'absolute',
    left: '50%',
    marginLeft: -2,
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  needleGradient: {
    borderRadius: 2,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 4,
  },
  arrowHead: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.darkTeal[950],
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -2,
  },
  arrowIcon: {
    marginTop: -1,
  },
  needleTail: {
    position: 'absolute',
    left: '50%',
    marginLeft: -3,
    width: 6,
    height: 20,
    borderRadius: 3,
  },
});

export default QiblaNeedle;

