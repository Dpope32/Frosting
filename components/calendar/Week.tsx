import React from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent, useUserStore } from '@/store';
import { nbaTeams } from '@/constants';
import { getWeekStyles } from './WeekStyles';
import { format, addDays, startOfWeek } from 'date-fns';

interface WeekProps {
  startDate: Date;
  events: CalendarEvent[];
  onDayPress: (date: Date) => void;
  isDark: boolean;
  primaryColor: string;
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

export const Week: React.FC<WeekProps> = ({ startDate, events, onDayPress, isDark, primaryColor }) => {
  const styles = getWeekStyles(isDark);
  const showNBAGamesInCalendar = useUserStore(state => state.preferences.showNBAGamesInCalendar);
  
  // Get the start of the week (Sunday)
  const weekStart = startOfWeek(startDate);
  
  // Generate an array of 7 days starting from the week start
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const eventsByDate = React.useMemo(() => {
    const weekStartStr = weekStart.toISOString().split('T')[0];
    const weekEndStr = addDays(weekStart, 6).toISOString().split('T')[0];
    const filteredEvents = dedupeHolidays(events.filter(e => e.date >= weekStartStr && e.date <= weekEndStr));
    return filteredEvents
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
            taskName: '',
            nba: false,
            holiday: false,
            holidayColor: '',
            holidayIcon: '',
            teamCode: null,
            personalName: ''
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
          acc[e.date].taskName = e.title || 'Task';
        } else {
          acc[e.date].personal = true;
          acc[e.date].personalName = e.title || '';
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
        taskName: string;
        nba: boolean;
        holiday: boolean;
        holidayColor: string;
        holidayIcon: string;
        teamCode: string | null;
        personalName: string;
      }>);
  }, [weekStart, events]);

  const weekTitle = `${format(weekStart, 'MMM d')} - ${format(addDays(weekStart, 6), 'MMM d, yyyy')}`;

  return (
    <View style={styles.weekContainer}>
      <View style={styles.header}>
        <Text style={styles.weekText}>
          {weekTitle}
        </Text>
      </View>

      <View style={styles.daysList}>
        {days.map((day, index) => {
          const dateKey = day.toISOString().split('T')[0];
          const dayEvents = eventsByDate[dateKey] || {
            birthday: false, personal: false, work: false, family: false, bill: false, billName: '',
            task: false, taskName: '', nba: false, holiday: false, holidayColor: '', holidayIcon: '', teamCode: null, personalName: ''
          };

          const isToday = day.toDateString() === new Date().toDateString();
          const isPastDate = day < new Date(new Date().setHours(0, 0, 0, 0));
          const weekday = day.getDay();
          const isWeekend = weekday === 0 || weekday === 6;
          const dayName = format(day, 'EEE');
          const dayNumber = format(day, 'd');

          return (
            <TouchableOpacity
              key={index}
              onPress={() => onDayPress(day)}
              onPressIn={() => { if (Platform.OS !== 'web') Haptics.selectionAsync(); }}
              style={[
                styles.dayRow,
                isWeekend && styles.weekendDayRow,
                isToday && [styles.today, { borderColor: primaryColor, borderBottomColor: primaryColor, borderWidth: 1.5 }],
                dayEvents.holiday && !isToday && { backgroundColor: `${dayEvents.holidayColor}20` },
                isPastDate && styles.pastDateRow,
                Platform.OS === 'web' && { cursor: 'pointer', borderRadius: 6 }
              ]}
            >
              <View style={styles.dayInfo}>
                <Text style={[
                  styles.dayName,
                  isToday && { color: primaryColor },
                  isPastDate && !isToday && styles.pastDateText
                ]}>
                  {dayName}
                </Text>
                <Text style={[
                  styles.dayNumber,
                  isToday && { color: primaryColor },
                  dayEvents.holiday && !isToday && { color: dayEvents.holidayColor },
                  dayEvents.birthday && !isToday && { color: '#FF69B4' },
                  isPastDate && !isToday && styles.pastDateText
                ]}>
                  {dayNumber}
                </Text>
              </View>

              <View style={styles.eventsContainer}>
                {dayEvents.holiday && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.holidayIconText}>{dayEvents.holidayIcon}</Text>
                    <Text style={[styles.eventText, { color: dayEvents.holidayColor }]}>Holiday</Text>
                  </View>
                )}

                {dayEvents.birthday && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.birthdayIconText}>🎉</Text>
                    <Text style={[styles.eventText, { color: '#FF69B4' }]}>Birthday</Text>
                  </View>
                )}

                {dayEvents.bill && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#FF5252' }]}>{dayEvents.billName}</Text>
                  </View>
                )}

                {dayEvents.task && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#FF9800' }]}>{dayEvents.taskName || 'Task'}</Text>
                  </View>
                )}

                {dayEvents.work && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#2196F3' }]}>Work</Text>
                  </View>
                )}

                {dayEvents.family && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#9C27B0' }]}>Family</Text>
                  </View>
                )}

                {dayEvents.personal && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: 'rgb(72, 137, 15)' }]}>{dayEvents.personalName || 'Personal'}</Text>
                  </View>
                )}

                {showNBAGamesInCalendar && dayEvents.nba && dayEvents.teamCode && nbaTeams.find(t => t.code === dayEvents.teamCode) && (
                  <View style={styles.eventIndicator}>
                    <Image
                      source={{ uri: nbaTeams.find(t => t.code === dayEvents.teamCode)?.logo }}
                      style={styles.nbaLogo}
                      resizeMode="contain"
                    />
                    <Text style={styles.eventText}>NBA Game</Text>
                  </View>
                )}
              </View>

              {isPastDate && !isToday && (
                <>
                  <View style={styles.pastDateOverlay} />
                  <View style={styles.pastDateStrikethrough1} />
                  <View style={styles.pastDateStrikethrough2} />
                </>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}; 