import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '@/store/CalendarStore';
import { nbaTeams } from '@/constants/nba';
import { useUserStore } from '@/store/UserStore';
import { getUSHolidays } from '@/services/holidayService';

const shouldUseDarkText = (backgroundColor: string): boolean => {
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5;
};

interface MonthProps {
  date: Date;
  events: CalendarEvent[];
  onDayPress: (date: Date) => void;
  isDark: boolean;
  primaryColor: string;
}

export const Month: React.FC<MonthProps> = ({ date, events, onDayPress, isDark, primaryColor }) => {
  // Get the showNBAGamesInCalendar preference
  const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const eventsByDate = React.useMemo(() => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const monthStart = new Date(year, month, 1).toISOString().split('T')[0];
    const monthEnd = new Date(year, month + 1, 0).toISOString().split('T')[0];
    
    return events
      .filter(event => event.date >= monthStart && event.date <= monthEnd)
      .reduce((acc, event) => {
        if (!acc[event.date]) { 
          acc[event.date] = { 
            birthday: false, 
            personal: false, 
            work: false, 
            task: false,
            family: false, 
            bill: false, 
            nba: false, 
            holiday: false, 
            holidayColor: '',
            holidayIcon: '',
            teamCode: null 
          }
        }
        
        if (event.type === 'birthday') acc[event.date].birthday = true;
        else if (event.type === 'work') acc[event.date].work = true;
        else if (event.type === 'family') acc[event.date].family = true;
        else if (event.type === 'bill') acc[event.date].bill = true;
        else if (event.type === 'nba') { 
          acc[event.date].nba = true;
          acc[event.date].teamCode = event.teamCode || null;
        }
        else if (event.type === 'holiday') { 
          acc[event.date].holiday = true;
          acc[event.date].holidayColor = event.holidayColor || '#E53935';
          acc[event.date].holidayIcon = event.holidayIcon || '🎉';
        }
        else if (event.type === 'task' as CalendarEvent['type']) {
          acc[event.date].task = true;
        }
        else acc[event.date].personal = true; 
        
        return acc;
      }, {} as Record<string, { 
        birthday: boolean; 
        personal: boolean; 
        work: boolean; 
        family: boolean; 
        bill: boolean;
        task: boolean;
        nba: boolean;
        holiday: boolean;
        holidayColor: string;
        holidayIcon: string;
        teamCode: string | null;
      }>);
  }, [date.getFullYear(), date.getMonth(), events]);
  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(date);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  const monthName = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const todayTextColor = shouldUseDarkText(primaryColor) ? '#000000' : '#ffffff';

  return (
    <View style={[styles.calendar, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
      <View style={styles.header}>
        <Text style={[styles.monthText, { color: isDark ? '#ffffff' : '#000000' }]}>
          {monthName} {year}
        </Text>
      </View>
      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={[styles.weekDay, { color: isDark ? '#ffffff' : '#000000' }]}>{day}</Text>
          </View>
        ))}
      </View>
      <View style={styles.daysGrid}>
        {blanks.map((blank) => {
          const blankIndex = blank;
          const rowIndex = Math.floor(blankIndex / 7);
          const totalRows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
          const isLastRow = rowIndex === totalRows - 1;

          return (
            <View 
              key={`blank-${blank}`} 
              style={[
                styles.dayCell,
                isLastRow && styles.lastRowCell
              ]} 
            />
          );
        })}
        {days.map((day) => {
          const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
          const dateKey = currentDate.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateKey] || { birthday: false, personal: false, work: false, family: false, bill: false, nba: false, teamCode: null};
          const hasBirthday = dayEvents.birthday;
          const hasPersonalEvent = dayEvents.personal;
          const hasWorkEvent = dayEvents.work;
          const hasFamilyEvent = dayEvents.family;
          const hasBill = dayEvents.bill;
          const today = new Date();
          const isToday = currentDate.toDateString() === today.toDateString();
          const isPastDate = currentDate < new Date(today.setHours(0, 0, 0, 0));
          const dayIndex = day + firstDayOfMonth - 1;
          const rowIndex = Math.floor(dayIndex / 7);
          const totalRows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
          const isLastRow = rowIndex === totalRows - 1;

          return (
            <TouchableOpacity
              key={day}
              onPress={() => onDayPress(currentDate)}
              onPressIn={() => {if (Platform.OS !== 'web') {Haptics.selectionAsync()}}}
              style={[
                styles.dayCell,
                isToday && [styles.today, { backgroundColor: primaryColor }],
                dayEvents.holiday && !isToday && {
                  backgroundColor: `${dayEvents.holidayColor}20`, 
                },
                isLastRow && styles.lastRowCell, 
                Platform.OS === 'web' && {
                  // @ts-ignore - Web-specific CSS properties
                  cursor: 'pointer',
                  borderRadius: 4,
                },
              ]}
            >
              <View style={[ styles.dayCellContent, isPastDate && !isToday && styles.pastDateOverlay]}>
                <View style={styles.dayWrapper}>
                  <Text
                    style={[
                      styles.dayText,
                      { color: isDark ? '#ffffff' : '#000000' },
                      isToday && { color: todayTextColor },
                      hasBirthday && !isToday && { color: '#FF69B4' },
                      dayEvents.holiday && !isToday && { color: dayEvents.holidayColor }, 
                      isToday && styles.selectedText,
                    ]}
                  >
                    {day}
                  </Text>
                  {hasBill && <Text style={styles.billIcon}>$</Text>}
                  {hasBirthday && <Text style={styles.birthdayIcon}>🎉</Text>}
                  {dayEvents.holiday && (
                    <Text style={[
                      styles.holidayIcon, 
                      { fontSize: 8, right: -8, top: -8 }
                    ]}>
                      {dayEvents.holidayIcon}
                    </Text>
                  )}
                </View>
                
                <View style={styles.indicatorContainer}>
                  {hasPersonalEvent && <View style={[styles.eventDot, { backgroundColor: '#4CAF50' }]} />}
                  {hasWorkEvent && <View style={[styles.eventDot, { backgroundColor: '#2196F3' }]} />}
                  {hasFamilyEvent && <View style={[styles.eventDot, { backgroundColor: '#9C27B0' }]} />}
                  {hasBirthday && <View style={[styles.eventDot, { backgroundColor: '#FF69B4' }]} />}
                  {dayEvents.task && <View style={[styles.eventDot, { backgroundColor: '#FF9800' }]} />} 
                </View>
                
                {showNBAGamesInCalendar && dayEvents.nba && dayEvents.teamCode && (
                  <View style={styles.nbaLogoContainer}>
                    {nbaTeams.find(team => team.code === dayEvents.teamCode) && (
                      <Image
                        source={{ uri: nbaTeams.find(team => team.code === dayEvents.teamCode)?.logo }}
                        style={styles.nbaLogo}
                        resizeMode="contain"
                      />
                    )}
                  </View>
                )}
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  calendar: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 16,
    margin: 16,
    ...(Platform.OS === 'web' ? {
      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
      // Removed maxWidth since we're displaying 2 months side by side
    } as any : {}),
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
    height: 48,
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDay: {
    fontSize: 12,
    fontWeight: '600',
  },
  holidayCell: {
    backgroundColor: 'rgba(229, 57, 53, 0.1)', 
  },
  holidayText: {
    fontSize: 8,
    color: '#E53935',
    textAlign: 'center',
    marginTop: 1,
    fontWeight: 'bold',
  },
  holidayIcon: {
    position: 'absolute',
    zIndex: 1,
    marginTop: 2
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: '14.28%',
    aspectRatio: 1,
    padding: 2,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  lastRowCell: {
    borderBottomWidth: 0, 
  },
  dayCellContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 2,
  },
  pastDateOverlay: {
    opacity: 0.3, 
  },
  dayWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    position: 'relative',
    minWidth: 24,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  today: {
    borderRadius: 8,
  },
  selectedText: {
    fontWeight: 'bold',
  },
  indicatorContainer: {
    flexDirection: 'row',
    gap: 2,
    position: 'absolute',
    bottom: 2,
    left: 0,
    right: 0,
    justifyContent: 'center',
  },
  eventDot: {
    width: Platform.OS === 'web' ? 6 : 4,
    height: Platform.OS === 'web' ? 6 : 4,
    borderRadius: Platform.OS === 'web' ? 3 : 2,
    marginTop: 2,
  },
  billIcon: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#4CAF50',
    position: 'absolute', 
    left: -4,
    top: -4,
  },
  birthdayIcon: {
    fontSize: 10,
    position: 'absolute',
    right: -10,
    top: -10,
  },
  nbaLogoContainer: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: Platform.OS === 'web' ? 16 : 12,
    height: Platform.OS === 'web' ? 16 : 12,
    zIndex: 1,
  },
  nbaLogo: {
    width: '100%',
    height: '100%',
  },
});
