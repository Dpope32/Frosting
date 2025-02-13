import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity  } from 'react-native';
import * as Haptics from 'expo-haptics';
import { CalendarEvent } from '@/store/CalendarStore';

interface MonthProps {
    date: Date;
    events: CalendarEvent[];
    onDayPress: (date: Date) => void;
    isDark: boolean;
    primaryColor: string;
} 

export const Month: React.FC<MonthProps> = ({ date, events, onDayPress, isDark, primaryColor }) => {
    const getDaysInMonth = (date: Date) => {
      const year = date.getFullYear();
      const month = date.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const firstDayOfMonth = new Date(year, month, 1).getDay();
      return { daysInMonth, firstDayOfMonth };
    };
  
    const { daysInMonth, firstDayOfMonth } = getDaysInMonth(date);
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);
  
    const monthName = date.toLocaleString('default', { month: 'long' });
    const year = date.getFullYear();
  
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
              <Text style={[styles.weekDay, { color: isDark ? '#ffffff' : '#000000' }]}>
                {day}
              </Text>
            </View>
          ))}
        </View>
        <View style={styles.daysGrid}>
          {blanks.map((blank) => (
            <View key={`blank-${blank}`} style={styles.dayCell} />
          ))}
          {days.map((day) => {
            const currentDate = new Date(date.getFullYear(), date.getMonth(), day);
            const dateKey = currentDate.toISOString().split('T')[0];
            const dayEvents = events.filter((event) => event.date === dateKey);
            const hasBirthday = dayEvents.some(event => event.type === 'birthday');
            const hasRegularEvent = dayEvents.some(event => !event.type || event.type === 'regular');
            const hasBill = dayEvents.some(event => event.type === 'bill');
            const today = new Date();
            const isToday = currentDate.toDateString() === today.toDateString();
            if (isToday) {
              console.log('[Month] Date comparison:', {
                currentDate: currentDate.toISOString(),
                today: today.toISOString(),
                isToday
              });
            }
            
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday && [styles.today, { backgroundColor: primaryColor }],
                  !isToday && hasRegularEvent && [styles.busy, { backgroundColor: '#F44336' }],
                  !isToday && hasBirthday && !hasRegularEvent && styles.birthdayCell,
                ]}
                onPress={() => onDayPress(currentDate)}
                onPressIn={() => Haptics.selectionAsync()}
              >
                <View style={styles.dayCellContent}>
                  <View style={styles.dayWrapper}>
                    <Text
                      style={[
                        styles.dayText,
                        isToday && styles.selectedText,
                        hasBirthday && !isToday && { color: '#FF69B4' },
                        hasRegularEvent && !isToday && styles.selectedText,
                        { color: isDark ? '#ffffff' : '#000000' },
                      ]}
                    >
                      {day}
                    </Text>
                    {hasBill && <Text style={styles.billIcon}>$</Text>}
                    {hasBirthday && <Text style={styles.birthdayIcon}>🎉</Text>}
                  </View>
                  {(hasRegularEvent || hasBirthday) && (
                    <View style={styles.indicatorContainer}>
                      {hasRegularEvent && <View style={[styles.eventDot, { backgroundColor: '#F44336' }]} />}
                      {hasBirthday && <View style={[styles.eventDot, { backgroundColor: '#FF69B4' }]} />}
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
    daysGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    dayCell: {
      width: '14.28%',
      aspectRatio: 1,
      padding: 2,
    },
    dayCellContent: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      padding: 2,
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
    busy: {
      borderRadius: 8,
    },
    selectedText: {
      color: '#ffffff',
      fontWeight: 'bold',
    },
    birthdayCell: {
      borderRadius: 8,
      borderWidth: 2,
      borderColor: '#FF69B4',
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
      width: 4,
      height: 4,
      borderRadius: 2,
      marginTop: 2,
    },
    billIcon: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#4CAF50',
      position: 'absolute',
      right: -10,
      top: -2,
    },
    birthdayIcon: {
      fontSize: 14,
      position: 'absolute',
      right: -10,
      top: -10,
    },
  });
