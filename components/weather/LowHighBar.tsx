import React from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { getTemperatureColor } from '@/services/weatherServices';
import { isIpad } from '@/utils/deviceUtils';

interface LowHighBarProps {
  low: number;
  high: number;
  isDark: boolean;
}

const LowHighBar: React.FC<LowHighBarProps> = ({ low, high, isDark }) => {
  const lowColor = getTemperatureColor(low, isDark);
  const highColor = getTemperatureColor(high, isDark);
  const large = isIpad();
  const diff = high - low;
  const maxDiff = 40;
  const ratio = Math.min(Math.max(diff, 0), maxDiff) / maxDiff;
  const minWidth = large ? 60 : 30;
  const maxWidth = large ? 160 : 80;
  const width = minWidth + ratio * (maxWidth - minWidth);
  const height = large ? 4 : 2;
  const borderRadius = height / 2;

  // Determine track (background) and bar widths
  const trackWidth = large ? 160 : 80;
  const barWidth = ratio * trackWidth;
  // Choose a neutral track color
  const trackColor = isDark ? 'rgba(255,255,255,0.3)' : '#e5e7eb';
  return (
    <View style={[styles.track, { width: trackWidth, height, borderRadius, backgroundColor: trackColor }]}> 
      <LinearGradient
        colors={[lowColor, highColor]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: barWidth, height, borderRadius }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
    marginBottom: 10,
  },
});

export default LowHighBar; 