import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Get current month's days
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    return { daysInMonth, firstDayOfMonth };
  };

  const { daysInMonth, firstDayOfMonth } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDayOfMonth }, (_, i) => i);

  // Get month name
  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  // Navigation handlers
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleDateSelect = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    console.log('Selected date:', newDate.toISOString().split('T')[0]);
  };

  return (
    <View style={styles.container}>
      <View style={[styles.calendar, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth}>
            <Text style={[styles.navButton, { color: isDark ? '#ffffff' : '#000000' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {monthName} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth}>
            <Text style={[styles.navButton, { color: isDark ? '#ffffff' : '#000000' }]}>→</Text>
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekDays}>
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <Text 
              key={day} 
              style={[styles.weekDay, { color: isDark ? '#ffffff' : '#000000' }]}
            >
              {day}
            </Text>
          ))}
        </View>

        {/* Calendar grid */}
        <View style={styles.daysGrid}>
          {/* Blank spaces */}
          {blanks.map((blank) => (
            <View key={`blank-${blank}`} style={styles.dayCell} />
          ))}
          
          {/* Days */}
          {days.map((day) => {
            const isToday = 
              day === new Date().getDate() && 
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const isSelected = selectedDate && 
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  isToday && styles.today,
                  isSelected && styles.selected
                ]}
                onPress={() => handleDateSelect(day)}
              >
                <Text style={[
                  styles.dayText,
                  { color: isDark ? '#ffffff' : '#000000' },
                  isToday && styles.todayText,
                  isSelected && styles.selectedText
                ]}>
                  {day}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100, // Account for header
  },
  calendar: {
    borderRadius: 10,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 15,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  navButton: {
    fontSize: 24,
    paddingHorizontal: 10,
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  weekDay: {
    flex: 1,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 14,
  },
  today: {
    backgroundColor: '#2196F3',
    borderRadius: 20,
  },
  todayText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
  selected: {
    backgroundColor: '#4CAF50',
    borderRadius: 20,
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: 'bold',
  }
});
