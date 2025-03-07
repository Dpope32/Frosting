import React from 'react';
import { View, StyleSheet, Text, Platform, Image, Dimensions } from 'react-native';
import { useNBAStore } from '@/store/NBAStore';
import { useUserStore } from '@/store/UserStore';
import { nbaTeams } from '@/constants/nba';

// Helper function to detect if device is iPad
const isIpad = () => {
  const { width, height } = Dimensions.get('window');
  return (
    Platform.OS === 'ios' &&
    Math.min(width, height) >= 768 &&
    Math.max(width, height) >= 1024
  );
};

interface LegendProps { 
  isDark: boolean 
}

interface LegendItem { 
  color: string; 
  label: string; 
  isNBA?: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isDark }) => {
  const { teamCode } = useNBAStore();
  const team = nbaTeams.find(t => t.code === teamCode);
  const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  
  const baseItems: LegendItem[] = [
    { color: '#4CAF50', label: 'Personal' },
    { color: '#2196F3', label: 'Work' },
    { color: '#9C27B0', label: 'Family' },
    { color: '#FF69B4', label: 'Birthdays' },
    { color: '#FF9800', label: 'Tasks' },
  ];
  
  const items: LegendItem[] = showNBAGamesInCalendar 
    ? [...baseItems, { color: '#FF5722', label: 'NBA Games', isNBA: true }] 
    : baseItems;

  const isWebOrIpad = Platform.OS === 'web' || isIpad();
  
  return (
    <View style={[styles.container, isWebOrIpad && styles.containerWebIpad]}>
      <View style={[styles.row, isWebOrIpad && styles.rowWebIpad]}>
        {items.map((item, index) => (
          <View key={index} style={[styles.item, isWebOrIpad && styles.itemWebIpad]}>
            {item.isNBA && team ? (
              <Image
                source={{ uri: team.logo }}
                style={isWebOrIpad ? styles.nbaLogoWebIpad : styles.nbaLogo}
                resizeMode="contain"
              />
            ) : (
              <View style={[
                styles.dot, 
                { backgroundColor: item.color },
                isWebOrIpad && styles.dotWebIpad
              ]} />
            )}
            <Text style={[
              styles.label, 
              { color: isDark ? '#999999' : '#666666' },
              isWebOrIpad && styles.labelWebIpad
            ]}>
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
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  containerWebIpad: {
    paddingBottom: 16,
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 12,
  },
  rowWebIpad: {
    gap: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemWebIpad: {
    gap: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  dotWebIpad: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  label: {
    fontSize: 11,
    fontWeight: '400',
  },
  labelWebIpad: {
    fontSize: 14,
    fontWeight: '500',
  },
  nbaLogo: {
    width: 12,
    height: 12,
  },
  nbaLogoWebIpad: {
    width: 16,
    height: 16,
  },
});