/* CalendarScreen.tsx */
import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, GestureResponderEvent, PanResponder, PanResponderGestureState, LayoutRectangle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useCalendarStore } from '@/store/CalendarStore';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [gridLayout, setGridLayout] = useState<LayoutRectangle | null>(null);
  const lastToggledDate = useRef<string | null>(null);

  const busyDays = useCalendarStore((state) => state.busyDays);
  const toggleBusyDay = useCalendarStore((state) => state.toggleBusyDay);

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

  const monthName = currentDate.toLocaleString('default', { month: 'long' });
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    setSelectedDate(null);
  };

  const handleDatePress = (day: number, longPress = false) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    setSelectedDate(newDate);
    
    if (longPress) {
      setIsDragging(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    const dateKey = newDate.toISOString().split('T')[0];
    if (dateKey !== lastToggledDate.current) {
      toggleBusyDay(dateKey);
      lastToggledDate.current = dateKey;
      if (!longPress) {
        Haptics.selectionAsync();
      }
    }
  };

  const getDayFromPoint = (x: number, y: number): number | null => {
    if (!gridLayout) return null;

    const cellWidth = gridLayout.width / 7;
    const cellHeight = cellWidth; // Square cells
    
    const row = Math.floor(y / cellHeight);
    const col = Math.floor(x / cellWidth);
    const dayIndex = row * 7 + col - firstDayOfMonth;
    
    if (dayIndex >= 0 && dayIndex < daysInMonth) {
      return dayIndex + 1;
    }
    return null;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        const { locationX, locationY } = event.nativeEvent;
        const day = getDayFromPoint(locationX, locationY);
        if (day !== null) {
          handleDatePress(day, true);
        }
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        if (!isDragging) return;
        
        const { locationX, locationY } = event.nativeEvent;
        const day = getDayFromPoint(locationX, locationY);
        if (day !== null) {
          const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
            .toISOString()
            .split('T')[0];
          
          if (dateKey !== lastToggledDate.current) {
            toggleBusyDay(dateKey);
            lastToggledDate.current = dateKey;
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      },
      onPanResponderRelease: () => {
        if (isDragging) {
          setIsDragging(false);
          lastToggledDate.current = null;
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
      },
    })
  ).current;

  return (
    <View style={styles.container}>
      <View style={[styles.calendar, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={prevMonth} style={styles.navButtonContainer}>
            <Text style={[styles.navButton, { color: isDark ? '#ffffff' : '#000000' }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.monthText, { color: isDark ? '#ffffff' : '#000000' }]}>
            {monthName} {year}
          </Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navButtonContainer}>
            <Text style={[styles.navButton, { color: isDark ? '#ffffff' : '#000000' }]}>→</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekDays}>
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map((day) => (
            <Text
              key={day}
              style={[styles.weekDay, { color: isDark ? '#ffffff' : '#000000' }]}
            >
              {day}
            </Text>
          ))}
        </View>

        <View 
          style={styles.daysGrid}
          onLayout={(e) => setGridLayout(e.nativeEvent.layout)}
          {...panResponder.panHandlers}
        >
          {blanks.map((blank) => (
            <View key={`blank-${blank}`} style={styles.dayCell} />
          ))}
          {days.map((day) => {
            const isToday =
              day === new Date().getDate() &&
              currentDate.getMonth() === new Date().getMonth() &&
              currentDate.getFullYear() === new Date().getFullYear();

            const isSelected =
              selectedDate &&
              day === selectedDate.getDate() &&
              currentDate.getMonth() === selectedDate.getMonth() &&
              currentDate.getFullYear() === selectedDate.getFullYear();

            const dateKey = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
              .toISOString()
              .split('T')[0];
            const isBusy = !!busyDays[dateKey];

            const backgroundStyle = (() => {
              if (isSelected && isBusy) return styles.selectedBusy;
              if (isSelected) return styles.selected;
              if (isBusy) return styles.busy;
              if (isToday) return styles.today;
              return undefined;
            })();

            const textStyle = (() => {
              if (isSelected || isToday || isBusy) return styles.selectedText;
              return { color: isDark ? '#ffffff' : '#000000' };
            })();

            return (
              <TouchableOpacity
                key={day}
                style={[
                  styles.dayCell,
                  backgroundStyle,
                  isDragging && styles.dragging
                ]}
                onPress={() => handleDatePress(day)}
                onLongPress={() => handleDatePress(day, true)}
                onPressOut={() => {}}
                onPressIn={() => !isDragging && Haptics.selectionAsync()}
                delayLongPress={200}
              >
                <Text style={[styles.dayText, textStyle]}>
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
    paddingTop: 100,
    paddingHorizontal: 16
  },
  calendar: {
    borderRadius: 20,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 16,
    margin: 16,
    backgroundColor: '#fff'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    height: 48
  },
  monthText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: 16
  },
  navButtonContainer: {
    width: 48,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center'
  },
  navButton: {
    fontSize: 24,
    width: 40,
    height: 40,
    lineHeight: 40,
    textAlign: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)'
  },
  weekDays: {
    flexDirection: 'row',
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    paddingBottom: 8
  },
  weekDay: {
    width: `${100 / 7}%`,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#666'
  },
  daysGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  dayCell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 2
  },
  dayText: {
    fontSize: 16,
    fontWeight: '500'
  },
  dragging: {
    transform: [{ scale: 0.95 }]
  },
  today: {
    backgroundColor: '#2196F3',
    elevation: 4,
    shadowColor: '#2196F3',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#1976D2'
  },
  selected: {
    backgroundColor: '#4CAF50',
    elevation: 4,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#388E3C'
  },
  busy: {
    backgroundColor: '#F44336',
    elevation: 4,
    shadowColor: '#F44336',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: '#D32F2F'
  },
  selectedBusy: {
    backgroundColor: '#9C27B0',
    elevation: 5,
    shadowColor: '#9C27B0',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
    borderWidth: 2,
    borderColor: '#7B1FA2'
  },
  selectedText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16
  }
});
