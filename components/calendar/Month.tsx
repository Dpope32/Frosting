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
            const isBusy = dayEvents.length > 0;
            const isToday = currentDate.toDateString() === new Date().toDateString();
            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday && [styles.today, { backgroundColor: primaryColor }],
                  isBusy && [styles.busy, { backgroundColor: '#F44336' }],
                ]}
                onPress={() => onDayPress(currentDate)}
                onPressIn={() => Haptics.selectionAsync()}
              >
                <View style={styles.dayCellContent}>
                  <Text
                    style={[
                      styles.dayText,
                      (isToday || isBusy) && styles.selectedText,
                      { color: isDark ? '#ffffff' : '#000000' },
                    ]}
                  >
                    {day}
                  </Text>
                  {isBusy && <View style={styles.eventDot} />}
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
    eventDot: {
      width: 4,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#ffffff',
      marginTop: 2,
    },
  });
  