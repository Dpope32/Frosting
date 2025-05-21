import React from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent, useUserStore } from '@/store';
import { nbaTeams } from '@/constants';
import { getMonthStyles } from './MonthStyles';

// List of holidays to exclude from display
const EXCLUDED_HOLIDAYS = [
  'Columbus Day',
  'Juneteenth',
  'Indigenous Peoples\' Day'
];

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
  webColumnCount: number;
}

const dedupeHolidays = (events: CalendarEvent[]): CalendarEvent[] => {
  const byDate: Record<string, CalendarEvent[]> = {};
  for (const e of events) {
    if (e.type === 'holiday') {
      if (!byDate[e.date]) byDate[e.date] = [];
      byDate[e.date].push(e);
    }
  }
  const deduped: Record<string, CalendarEvent> = {};
  for (const date in byDate) {
    const native = byDate[date].find(ev => ev.id.startsWith('device-'));
    deduped[date] = native || byDate[date][0];
  }
  // Return all non-holiday events, plus only the deduped holidays
  return [
    ...events.filter(e => e.type !== 'holiday'),
    ...Object.values(deduped)
  ];
};

export const Month: React.FC<MonthProps> = ({ date, events, onDayPress, isDark, primaryColor, webColumnCount }) => {
  const styles = getMonthStyles(webColumnCount, isDark);
  const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);

  const getDaysInMonth = (d: Date) => {
    const year = d.getFullYear();
    const month = d.getMonth();
    return {
      daysInMonth: new Date(year, month + 1, 0).getDate(),
      firstDayOfMonth: new Date(year, month, 1).getDay()
    };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(date);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  const monthName = date.toLocaleString('default', { month: 'long' });
  const year = date.getFullYear();
  const todayTextColor = primaryColor;

  const eventsByDate = React.useMemo(() => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const start = new Date(y, m, 1).toISOString().split('T')[0];
    const end = new Date(y, m + 1, 0).toISOString().split('T')[0];
    const filteredEvents = dedupeHolidays(events.filter(e => e.date >= start && e.date <= end));
    return filteredEvents
      // Filter out excluded holidays
      .filter(e => !(e.type === 'holiday' && EXCLUDED_HOLIDAYS.includes(e.title)))
      .reduce((acc, e) => {
        if (!acc[e.date]) {
          acc[e.date] = {
            birthday: false,
            birthdayName: '',
            personal: false,
            personalName: '',
            work: false,
            family: false,
            bill: false,
            billName: '',
            task: false,
            nba: false,
            holiday: false,
            holidayName: '',
            holidayColor: '',
            holidayIcon: '',
            teamCode: null
          };
        }
        if (e.type === 'birthday') {
          acc[e.date].birthday = true;
          acc[e.date].birthdayName = e.title || 'Birthday';
        }
        else if (e.type === 'work') acc[e.date].work = true;
        else if (e.type === 'family') acc[e.date].family = true;
        else if (e.type === 'bill') {
          acc[e.date].bill = true;
          acc[e.date].billName = e.title || 'Bill';
        }
        else if (e.type === 'nba') {
          acc[e.date].nba = true;
          acc[e.date].teamCode = e.teamCode || null;
        } else if (e.type === 'holiday') {
          // Double-check that this isn't an excluded holiday
          if (!EXCLUDED_HOLIDAYS.includes(e.title)) {
            acc[e.date].holiday = true;
            acc[e.date].holidayName = e.title || 'Holiday';
            acc[e.date].holidayColor = e.holidayColor || '#E53935';
            acc[e.date].holidayIcon = e.holidayIcon || '🎉';
          }
        } else if (e.type === 'task') {
          acc[e.date].task = true;
        } else {
          acc[e.date].personal = true;
          acc[e.date].personalName = e.title || '';
        }
        return acc;
      }, {} as Record<string, {
        birthday: boolean;
        birthdayName: string;
        personal: boolean;
        work: boolean;
        family: boolean;
        bill: boolean;
        billName: string;
        task: boolean;
        nba: boolean;
        holiday: boolean;
        holidayName: string;
        holidayColor: string;
        holidayIcon: string;
        teamCode: string | null;
        personalName: string;
      }>);
  }, [date, events]);

  return (
    <View style={styles.calendar}>
      <View style={styles.header}>
        <Text style={styles.monthText}>
          {monthName} {year}
        </Text>
      </View>

      <View style={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <View key={day} style={styles.weekDayContainer}>
            <Text style={styles.weekDay}>{day}</Text>
          </View>
        ))}
      </View>

      <View style={styles.daysGrid}>
        {blanks.map(blank => {
          const rowIndex = Math.floor(blank / 7);
          const totalRows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
          const isLastRow = rowIndex === totalRows - 1;
          return <View key={`blank-${blank}`} style={[styles.dayCell, isLastRow && styles.lastRowCell]} />;
        })}

        {days.map(day => {
          const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
          const dateKey = currentDate.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateKey] || {
            birthday: false, birthdayName: '', personal: false, work: false, family: false, bill: false, billName: '',
            task: false, nba: false, holiday: false, holidayName: '', holidayColor: '', holidayIcon: '', teamCode: null, personalName: ''
          };

          const isToday = currentDate.toDateString() === new Date().toDateString();
          const isPastDate = currentDate < new Date(new Date().setHours(0, 0, 0, 0));
          const dayIndex = day + firstDayOfMonth - 1;
          const rowIndex = Math.floor(dayIndex / 7);
          const totalRows = Math.ceil((daysInMonth + firstDayOfMonth) / 7);
          const isLastRow = rowIndex === totalRows - 1;
          const weekday = currentDate.getDay();
          const isWeekend = weekday === 0 || weekday === 6;

            return (
              <TouchableOpacity
                key={day}
                onPress={() => onDayPress(currentDate)}
                onPressIn={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
                style={[
                  styles.dayCell,
                  isWeekend && styles.weekendDayCell,
                  isToday && [styles.today, { borderColor: primaryColor }],
                  dayEvents.holiday && !isToday && { backgroundColor: `${dayEvents.holidayColor}20` },
                  isLastRow && styles.lastRowCell,
                  isPastDate && styles.pastDateCell,
                  Platform.OS === 'web' && { cursor: 'pointer', borderRadius: 6 }
                ]}
              >
                <View style={[
                  styles.dayCellContent, 
                  isPastDate && !isToday && styles.pastDateOverlay
                ]}>
                  <Text
                    style={[
                      styles.dayNumber,
                      isToday && { color: todayTextColor },
                      dayEvents.holiday && !isToday && { color: dayEvents.holidayColor },
                      dayEvents.birthday && !isToday && { color: '#FF69B4' }
                    ]}
                  >
                    {day}
                  </Text>
            
                  {isPastDate && !isToday && (
                    <View style={styles.pastDateStrikethrough} />
                  )}

                  {dayEvents.task && (
                    <View style={[styles.eventIconContainer, { 
                      bottom: webColumnCount === 1 ? 10 : (webColumnCount === 2 ? 4 : 2), 
                      zIndex: 5 
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#FFCC80' : '#FF9800', 
                        borderColor: isDark ? 'rgba(255,152,0,0.5)' : 'rgba(255,152,0,0.5)', 
                        borderWidth: 0.5,
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        🔔 Task Due
                      </Text>
                    </View>
                  )}
            
                  {dayEvents.holiday && (
                    <View style={[styles.holidayCell, { 
                      top: webColumnCount === 1 ? 16 : (webColumnCount === 2 ? 22 : 20),
                      bottom: 'auto',
                      zIndex: 5,
                      width: webColumnCount === 3 ? '90%' : '100%',
                      right: webColumnCount === 3 ? 'auto' : 4
                    }]}>
                      <Text style={[styles.holidayText, {
                        color: isDark ? '#FFFFFF' : '#006400', 
                        borderColor: isDark ? 'rgba(0,100,0,0.5)' : 'rgba(0,100,0,0.5)', 
                        borderWidth: 0.5,
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        {dayEvents.holidayName}
                      </Text>
                    </View>
                  )}

                  {dayEvents.birthday && (
                    <View style={[styles.eventIconContainer, { 
                      top: webColumnCount === 1 ? 2 : (webColumnCount === 2 ? 5 : 6),
                      zIndex: 6
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#FF80AB' : '#880E4F', 
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        {dayEvents.birthdayName.replace(/'s Birthday/g, '')}
                      </Text>
                    </View>
                  )}
            
                  {dayEvents.bill && (
                    <View style={[styles.eventIconContainer, { 
                      bottom: webColumnCount === 1 ? 33 : (webColumnCount === 2 ? 52 : 12), 
                      zIndex: 7
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#FF8A80' : '#E57373', 
                        borderColor: 'rgba(255,0,0,0.5)', 
                        borderWidth: 0.5, 
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        {dayEvents.billName}
                      </Text>
                    </View>
                  )}
            
                  {dayEvents.personal && (
                    <View style={[styles.eventIconContainer, { 
                      bottom: webColumnCount === 1 ? 22 : (webColumnCount === 2 ? 88 : 42),
                      zIndex: 5 ,
                      marginLeft: -2
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#81C784' : '#2E7D32', 
                        borderColor: isDark ? 'rgba(46,125,50,0.5)' : 'rgba(46,125,50,0.5)', 
                        borderWidth: 0.5,
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1}>
                        {dayEvents.personalName ? ` ${dayEvents.personalName}` : 'Personal Event'}
                      </Text>
                    </View>
                  )}

                  {dayEvents.work && (
                    <View style={[styles.eventIconContainer, { 
                      bottom: webColumnCount === 1 ? 2 : (webColumnCount === 2 ? 16 : 2),
                      zIndex: 8
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#90CAF9' : '#0D47A1', 
                        borderColor: isDark ? 'rgba(33,150,243,0.5)' : 'rgba(13,71,161,0.5)', 
                        borderWidth: 0.5,
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        Work Event
                      </Text>
                    </View>
                  )}

                  {dayEvents.family && (
                    <View style={[styles.eventIconContainer, { 
                      bottom: webColumnCount === 1 ? 12 : (webColumnCount === 2 ? 16 : 2),
                      zIndex: 5 
                    }]}>
                      <Text style={[styles.eventIconText, {
                        color: isDark ? '#CE93D8' : '#4A148C', 
                        borderColor: isDark ? 'rgba(156,39,176,0.5)' : 'rgba(74,20,140,0.5)', 
                        borderWidth: 0.5,
                        backgroundColor: 'transparent'
                      }]} numberOfLines={1} ellipsizeMode="tail">
                        Family Event
                      </Text>
                    </View>
                  )}            
                  {showNBAGamesInCalendar && dayEvents.nba && dayEvents.teamCode && nbaTeams.find(t => t.code === dayEvents.teamCode) && (
                    <View style={styles.nbaLogoContainer}>
                      <Image
                        source={{ uri: nbaTeams.find(t => t.code === dayEvents.teamCode)?.logo }}
                        style={styles.nbaLogo}
                        resizeMode="contain"
                      />
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
