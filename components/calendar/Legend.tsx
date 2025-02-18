import React from 'react';
import { View, StyleSheet, Text } from 'react-native';

interface LegendProps {
  isDark: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isDark }) => {
  const items = [
    { color: '#FF9800', label: 'Bills' },
    { color: '#4CAF50', label: 'Personal' },
    { color: '#2196F3', label: 'Work' },
    { color: '#9C27B0', label: 'Family' },
    { color: '#FF69B4', label: 'Birthdays' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            <View style={[styles.dot, { backgroundColor: item.color }]} />
            <Text style={[styles.label, { color: isDark ? '#999999' : '#666666' }]}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
  },
});
