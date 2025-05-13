import React from 'react';
import { View, StyleSheet, Text, Platform, ScrollView } from 'react-native';
import { isWeb } from 'tamagui';
//import { useNBAStore } from '@/store/NBAStore';
//import { useUserStore } from '@/store/UserStore';
//import { nbaTeams } from '@/constants/nba';
import { isIpad } from '@/utils/deviceUtils';

interface LegendProps { 
  isDark: boolean;
  eventTypes?: string[];
}

interface LegendItem { 
  color: string; 
  label: string;
  type: string;
  isNBA?: boolean;
}

export const Legend: React.FC<LegendProps> = ({ isDark, eventTypes = [] }) => {
 // const { teamCode } = useNBAStore();
 // const team = nbaTeams.find(t => t.code === teamCode);
 // const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  
  const baseItems: LegendItem[] = [
    { color: '#4CAF50', label: 'Personal', type: 'personal' },
    { color: '#2196F3', label: 'Work', type: 'work' },
    { color: '#9C27B0', label: 'Family', type: 'family' },
    { color: '#FF69B4', label: 'Birthdays', type: 'birthday' },
    { color: '#FF9800', label: 'Tasks', type: 'task' },
    { color: '#FFD700', label: 'Bills', type: 'bill' },
  ];
  
  // Filter items to only show types that exist in the calendar
  const items: LegendItem[] = eventTypes.length > 0
    ? baseItems.filter(item => eventTypes.includes(item.type))
    : baseItems;

  const isWebOrIpad = Platform.OS === 'web' || isIpad();
  
  // Don't render anything if there are no items to show
  if (items.length === 0) {
    return null;
  }
  
  return (
    <View 
      style={[
        styles.container, 
        isWebOrIpad && styles.containerWebIpad,
        { 
          paddingTop: 25,
          paddingBottom: 15,
          backgroundColor: 'transparent',
          ...Platform.select({
            web: {
              marginHorizontal: 0,
              paddingHorizontal: 0,
            },
          }),
        }
      ]}>
      {isWeb ? (
        <View style={styles.webContainer}>
          <View style={styles.webContent}>
            {items.map((item, index) => (
              <View key={index} style={styles.webItem}>
                <View style={[
                  styles.dot, 
                  { backgroundColor: item.color },
                  styles.webDot
                ]} />
                <Text style={[
                  styles.label, 
                  { color: isDark ? '#BBBBBB' : '#555555' },
                  styles.webLabel
                ]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : (
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
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
                  { color: isDark ? '#BBBBBB' : '#555555' },
                  isWebOrIpad && styles.labelWebIpad
                ]}>
                  {item.label}
                </Text>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  containerWebIpad: {
    paddingVertical: 10,
  },
  scrollContent: {
    paddingHorizontal: 12,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'nowrap',
    gap: 12,
  },
  rowWebIpad: {
    gap: 30,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  itemWebIpad: {
    gap: 8,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  dotWebIpad: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
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
  webContainer: {
    width: '100%',
    paddingHorizontal: 20,
  },
  webContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 20,
    justifyContent: 'flex-start',
  },
  webItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    minWidth: 100,
  },
  webDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  webLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});