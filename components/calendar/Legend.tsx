import React from 'react';
import { View, StyleSheet, Text, Platform  } from 'react-native';
//import { useNBAStore } from '@/store/NBAStore';
//import { useUserStore } from '@/store/UserStore';
//import { nbaTeams } from '@/constants/nba';
import { isIpad } from '@/utils/deviceUtils';

interface LegendProps { 
  isDark: boolean 
}

interface LegendItem { 
  color: string; 
  label: string; 
  isNBA?: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isDark }) => {
 // const { teamCode } = useNBAStore();
 // const team = nbaTeams.find(t => t.code === teamCode);
 // const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  
  const baseItems: LegendItem[] = [
    { color: '#4CAF50', label: 'Personal' },
    { color: '#2196F3', label: 'Work' },
    { color: '#9C27B0', label: 'Family' },
    { color: '#FF69B4', label: 'Birthdays' },
    { color: '#FF9800', label: 'Tasks' },
  ];
  
  const items: LegendItem[] = baseItems;
  const isWebOrIpad = Platform.OS === 'web' || isIpad();
  
  return (
    <View style={[styles.container, isWebOrIpad && styles.containerWebIpad]}>
      <View style={[styles.row, isWebOrIpad && styles.rowWebIpad]}>
        {items.map((item, index) => (
          <View key={index} style={[styles.item, isWebOrIpad && styles.itemWebIpad]}>
            <View style={[
              styles.dot, 
              { backgroundColor: item.color },
              isWebOrIpad && styles.dotWebIpad
            ]} />
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
    width: 8,
    height: 8,
    borderRadius: 4,
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