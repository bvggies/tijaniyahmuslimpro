import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Path } from 'react-native-svg';
import { colors } from '../../theme/colors';
import { spacing } from '../../theme/spacing';
import { typography } from '../../theme/typography';

type CompassDialProps = {
  size: number;
  qiblaBearing: number;
  isAligned?: boolean;
};

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const CompassDial: React.FC<CompassDialProps> = ({
  size,
  qiblaBearing,
  isAligned = false,
}) => {
  const center = size / 2;
  const radius = size / 2 - 20;
  const innerRadius = radius * 0.7;
  
  // Generate tick marks
  const majorTicks = [];
  const minorTicks = [];
  
  for (let i = 0; i < 360; i += 5) {
    const angle = (i * Math.PI) / 180;
    const isMajor = i % 15 === 0;
    
    const tick = {
      angle: i,
      x1: center + (radius - (isMajor ? 12 : 6)) * Math.sin(angle),
      y1: center - (radius - (isMajor ? 12 : 6)) * Math.cos(angle),
      x2: center + radius * Math.sin(angle),
      y2: center - radius * Math.cos(angle),
      isMajor,
    };
    
    if (isMajor) {
      majorTicks.push(tick);
    } else {
      minorTicks.push(tick);
    }
  }

  // Direction markers (N, E, S, W)
  const directions = [
    { label: 'N', angle: 0 },
    { label: 'E', angle: 90 },
    { label: 'S', angle: 180 },
    { label: 'W', angle: 270 },
  ];

  // Kaaba marker position (at qibla bearing)
  const kaabaAngle = (qiblaBearing * Math.PI) / 180;
  const kaabaRadius = radius - 8;
  const kaabaX = center + kaabaRadius * Math.sin(kaabaAngle);
  const kaabaY = center - kaabaRadius * Math.cos(kaabaAngle);

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Outer ring with glow effect when aligned */}
        <Circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={isAligned ? colors.evergreen[500] : 'rgba(255,255,255,0.12)'}
          strokeWidth={2}
          opacity={isAligned ? 0.6 : 0.4}
        />
        
        {/* Inner ring */}
        <Circle
          cx={center}
          cy={center}
          r={innerRadius}
          fill="none"
          stroke="rgba(255,255,255,0.08)"
          strokeWidth={1}
        />

        {/* Minor ticks */}
        {minorTicks.map((tick, index) => (
          <Line
            key={`minor-${index}`}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(255,255,255,0.15)"
            strokeWidth={1}
          />
        ))}

        {/* Major ticks */}
        {majorTicks.map((tick, index) => (
          <Line
            key={`major-${index}`}
            x1={tick.x1}
            y1={tick.y1}
            x2={tick.x2}
            y2={tick.y2}
            stroke="rgba(255,255,255,0.3)"
            strokeWidth={2}
          />
        ))}

        {/* Islamic rosette pattern (subtle watermark) */}
        <Path
          d={`M ${center} ${center - innerRadius * 0.3} 
              L ${center - innerRadius * 0.15} ${center - innerRadius * 0.1}
              L ${center} ${center + innerRadius * 0.1}
              L ${center + innerRadius * 0.15} ${center - innerRadius * 0.1} Z`}
          fill={colors.evergreen[500]}
          opacity={0.05}
        />
        <Path
          d={`M ${center} ${center + innerRadius * 0.3} 
              L ${center - innerRadius * 0.15} ${center + innerRadius * 0.1}
              L ${center} ${center - innerRadius * 0.1}
              L ${center + innerRadius * 0.15} ${center + innerRadius * 0.1} Z`}
          fill={colors.evergreen[500]}
          opacity={0.05}
        />

        {/* Kaaba marker */}
        <Circle
          cx={kaabaX}
          cy={kaabaY}
          r={6}
          fill={colors.evergreen[500]}
          opacity={0.8}
        />
        <Circle
          cx={kaabaX}
          cy={kaabaY}
          r={4}
          fill={colors.darkTeal[950]}
        />
      </Svg>

      {/* Direction labels */}
      {directions.map((dir) => {
        const angle = (dir.angle * Math.PI) / 180;
        const labelRadius = radius - 25;
        const x = center + labelRadius * Math.sin(angle);
        const y = center - labelRadius * Math.cos(angle);
        
        return (
          <Text
            key={dir.label}
            style={[
              styles.directionLabel,
              {
                left: x - 8,
                top: y - 10,
                color: dir.label === 'N' ? colors.evergreen[500] : colors.pineBlue[100],
                fontWeight: dir.label === 'N' ? '700' : '600',
              },
            ]}
          >
            {dir.label}
          </Text>
        );
      })}

      {/* Center dot */}
      <View style={[styles.centerDot, { left: center - 4, top: center - 4 }]}>
        <View style={styles.centerDotInner} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  directionLabel: {
    position: 'absolute',
    ...typography.bodyMd,
    fontSize: 16,
    fontWeight: '600',
  },
  centerDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.evergreen[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerDotInner: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.darkTeal[950],
  },
});

export default CompassDial;

