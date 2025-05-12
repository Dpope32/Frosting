import React from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '@/store/CalendarStore';
import { nbaTeams } from '@/constants/nba';
import { useUserStore } from '@/store/UserStore';
import { getMonthStyles } from './MonthStyles';

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
  const todayTextColor = shouldUseDarkText(primaryColor) ? '#000' : '#fff';

  const eventsByDate = React.useMemo(() => {
    const y = date.getFullYear();
    const m = date.getMonth();
    const start = new Date(y, m, 1).toISOString().split('T')[0];
    const end = new Date(y, m + 1, 0).toISOString().split('T')[0];

    return events
      .filter(e => e.date >= start && e.date <= end)
      .reduce((acc, e) => {
        if (!acc[e.date]) {
          acc[e.date] = {
            birthday: false,
            personal: false,
            work: false,
            family: false,
            bill: false,
            billName: '',
            task: false,
            nba: false,
            holiday: false,
            holidayColor: '',
            holidayIcon: '',
            teamCode: null
          };
        }
        if (e.type === 'birthday') acc[e.date].birthday = true;
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
          acc[e.date].holiday = true;
          acc[e.date].holidayColor = e.holidayColor || '#E53935';
          acc[e.date].holidayIcon = e.holidayIcon || '🎉';
        } else if (e.type === 'task') {
          acc[e.date].task = true;
        } else {
          acc[e.date].personal = true;
        }
        return acc;
      }, {} as Record<string, {
        birthday: boolean;
        personal: boolean;
        work: boolean;
        family: boolean;
        bill: boolean;
        billName: string;
        task: boolean;
        nba: boolean;
        holiday: boolean;
        holidayColor: string;
        holidayIcon: string;
        teamCode: string | null;
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
            birthday: false, personal: false, work: false, family: false, bill: false, billName: '',
            task: false, nba: false, holiday: false, holidayColor: '', holidayIcon: '', teamCode: null
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
            
                  {/* Add strikethrough for past dates */}
                  {isPastDate && !isToday && (
                    <View style={styles.pastDateStrikethrough} />
                  )}
            
                  {dayEvents.holiday && (
                    <View style={[styles.holidayIconContainer, { top: 4, right: 1 }]}>
                      <Text style={styles.holidayIconText}>{dayEvents.holidayIcon}</Text>
                    </View>
                  )}

                  {!dayEvents.holiday && dayEvents.birthday && (
                    <View style={styles.birthdayIconContainer}>
                      <Text style={styles.birthdayIconText}>🎉</Text>
                    </View>
                  )}
            
                  {!dayEvents.holiday && !dayEvents.birthday && dayEvents.bill && (
                    <View style={styles.billIconContainer}>
                      <Text style={styles.billIconText} numberOfLines={1} ellipsizeMode="tail">
                        {dayEvents.billName}
                      </Text>
                    </View>
                  )}
            
                  <View style={styles.indicatorContainer}>
                    {dayEvents.personal && <View style={[styles.eventDot, { backgroundColor: '#555' }]} />}
                    {dayEvents.work && <View style={[styles.eventDot, { backgroundColor: '#2196F3' }]} />}
                    {dayEvents.family && <View style={[styles.eventDot, { backgroundColor: '#9C27B0' }]} />}
                    {dayEvents.birthday && <View style={[styles.eventDot, { backgroundColor: '#FF69B4' }]} />}
                    {dayEvents.task && <View style={[styles.eventDot, { backgroundColor: '#FF9800' }]} />}
                    {dayEvents.bill && <View style={[styles.eventDot, { backgroundColor: '#FF5252' }]} />}
                  </View>
            
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
