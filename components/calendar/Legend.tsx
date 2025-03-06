import React from 'react';
import { View, StyleSheet, Text, Platform, Image } from 'react-native';
import { useNBAStore } from '@/store/NBAStore';
import { useUserStore } from '@/store/UserStore';
import { nbaTeams } from '@/constants/nba';

interface LegendProps { isDark: boolean }

interface LegendItem { color: string; label: string; isNBA?: boolean;}

export const Legend: React.FC<LegendProps> = ({ isDark }) => {
  const { teamCode } = useNBAStore();
  const team = nbaTeams.find(t => t.code === teamCode);
  const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  const baseItems: LegendItem[] = [
    { color: '#4CAF50', label: 'Personal' },
    { color: '#2196F3', label: 'Work' },
    { color: '#9C27B0', label: 'Family' },
    { color: '#FF69B4', label: 'Birthdays' },
  ];
  
  const items: LegendItem[] = showNBAGamesInCalendar  ? [...baseItems, { color: '#FF5722', label: 'NBA Games', isNBA: true }] : baseItems;

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {items.map((item, index) => (
          <View key={index} style={styles.item}>
            {item.isNBA && team ? (
              <Image 
                source={{ uri: team.logo }} 
                style={styles.nbaLogo} 
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.dot, { backgroundColor: item.color }]} />
            )}
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
    paddingHorizontal: 8,
    paddingBottom: 8,
    ...(Platform.OS === 'web' ? {
      paddingBottom: 16,
      marginBottom: 8,
    } : {}),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Platform.OS === 'web' ? 20 : 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Platform.OS === 'web' ? 8 : 4,
  },
  dot: {
    width: Platform.OS === 'web' ? 10 : 6,
    height: Platform.OS === 'web' ? 10 : 6,
    borderRadius: Platform.OS === 'web' ? 5 : 3,
  },
  label: {
    fontSize: Platform.OS === 'web' ? 14 : 11,
    fontWeight: Platform.OS === 'web' ? '500' : '400',
  },
  nbaLogo: {
    width: Platform.OS === 'web' ? 16 : 12,
    height: Platform.OS === 'web' ? 16 : 12,
  },
});
