import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { colors } from '../../theme/colors';

export const IslamicPattern: React.FC = () => {
  return (
    <View style={styles.container}>
      <Svg width="400" height="400" viewBox="0 0 200 200" style={styles.patternSvg}>
        {/* Repeating 8-pointed star pattern - very subtle */}
        <Path
          d="M100 20 L110 50 L140 50 L115 70 L125 100 L100 85 L75 100 L85 70 L60 50 L90 50 Z"
          fill={colors.evergreen[500]}
          opacity={0.03}
        />
        <Path
          d="M100 180 L90 150 L60 150 L85 130 L75 100 L100 115 L125 100 L115 130 L140 150 L110 150 Z"
          fill={colors.evergreen[500]}
          opacity={0.03}
        />
        <Path
          d="M20 100 L50 90 L50 60 L70 85 L100 75 L85 100 L100 125 L70 115 L50 140 L50 110 Z"
          fill={colors.evergreen[500]}
          opacity={0.025}
        />
        <Path
          d="M180 100 L150 110 L150 140 L130 115 L100 125 L115 100 L100 75 L130 85 L150 60 L150 90 Z"
          fill={colors.evergreen[500]}
          opacity={0.025}
        />
        {/* Additional geometric elements */}
        <Path
          d="M100 40 L120 60 L100 80 L80 60 Z"
          fill={colors.evergreen[500]}
          opacity={0.02}
        />
        <Path
          d="M100 120 L120 140 L100 160 L80 140 Z"
          fill={colors.evergreen[500]}
          opacity={0.02}
        />
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    overflow: 'hidden',
  },
  patternSvg: {
    width: '200%',
    height: '200%',
    position: 'absolute',
    top: -50,
    left: -50,
  },
});

export default IslamicPattern;

