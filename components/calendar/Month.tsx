import React from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '@/store/CalendarStore';
import { nbaTeams } from '@/constants/nba';
import { useUserStore } from '@/store/UserStore';
import { styles } from './MonthStyles';

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
            <View key={`blank-${blank}`}  style={[ styles.dayCell, isLastRow && styles.lastRowCell]}  /> )})}
          
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

