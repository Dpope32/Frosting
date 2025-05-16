import React from 'react';
import { View, Text, TouchableOpacity, Platform, Image } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent, useUserStore } from '@/store';
import { nbaTeams } from '@/constants/nba';
import { getWeekStyles } from './WeekStyles';
import { format, addDays, startOfWeek } from 'date-fns';

interface WeekProps {
  startDate: Date;
  events: CalendarEvent[];
  onDayPress: (date: Date) => void;
  isDark: boolean;
  primaryColor: string;
}

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

    return events
      .filter(e => e.date >= weekStartStr && e.date <= weekEndStr)
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
            task: false, nba: false, holiday: false, holidayColor: '', holidayIcon: '', teamCode: null
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
                isToday && [styles.today, { borderColor: primaryColor }],
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
                {/* Holiday indicator */}
                {dayEvents.holiday && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.holidayIconText}>{dayEvents.holidayIcon}</Text>
                    <Text style={[styles.eventText, { color: dayEvents.holidayColor }]}>Holiday</Text>
                  </View>
                )}

                {/* Birthday indicator */}
                {dayEvents.birthday && (
                  <View style={styles.eventIndicator}>
                    <Text style={styles.birthdayIconText}>🎉</Text>
                    <Text style={[styles.eventText, { color: '#FF69B4' }]}>Birthday</Text>
                  </View>
                )}

                {/* Bill indicator */}
                {dayEvents.bill && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#FF5252' }]}>{dayEvents.billName}</Text>
                  </View>
                )}

                {/* Task indicator */}
                {dayEvents.task && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#FF9800' }]}>Task</Text>
                  </View>
                )}

                {/* Work indicator */}
                {dayEvents.work && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#2196F3' }]}>Work</Text>
                  </View>
                )}

                {/* Family indicator */}
                {dayEvents.family && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#9C27B0' }]}>Family</Text>
                  </View>
                )}

                {/* Personal indicator */}
                {dayEvents.personal && (
                  <View style={styles.eventIndicator}>
                    <Text style={[styles.eventText, { color: '#555' }]}>Personal</Text>
                  </View>
                )}

                {/* NBA indicator */}
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

              {/* Add overlay and strikethrough for past dates */}
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