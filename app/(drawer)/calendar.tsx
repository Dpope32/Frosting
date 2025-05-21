import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native';
import { isWeb } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore, useCalendarViewStore, useToastStore, useCalendarStore } from '@/store';
import { Month } from '@/components/calendar/Month';
import { Week } from '@/components/calendar/Week';
import { Legend } from '@/components/calendar/Legend';
import { EventModal } from '@/components/calendar/EventModal';
import { CalendarAnalytics } from '@/components/calendar/CalendarAnalytics';
import { DebugTools } from '@/components/calendar/DebugTools';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarModals } from '@/hooks/useCalendarModals';
import { getCalendarStyles } from "@/components/calendar/CalendarStyles";
import { getUSHolidays } from '@/services';
import { isIpad } from '@/utils';
import { BlurView } from 'expo-blur';
import { startOfWeek, addWeeks } from 'date-fns';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { webColumnCount, viewMode } = useCalendarViewStore(); 
  const { events } = useCalendarStore();
  const { showToast } = useToastStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [months, setMonths] = useState<Date[]>([]);
  const [weeks, setWeeks] = useState<Date[]>([]);

  const { events: storeEvents } = useCalendarStore();
  const [combinedEvents, setCombinedEvents] = useState(storeEvents);
  const [activeEventTypes, setActiveEventTypes] = useState<string[]>([]);
  const calendarPermission = useUserStore(state => state.preferences.calendarPermission);
  
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    let holidays: any[] = [];
    if (!calendarPermission) {
      holidays = [
        ...getUSHolidays(currentYear),
        ...getUSHolidays(currentYear + 1)
      ];
    }
    const allEvents = [...storeEvents, ...holidays];
    setCombinedEvents(allEvents);
    const types: string[] = [];
    allEvents.forEach(event => {
      if (event.type && !types.includes(event.type)) {
        types.push(event.type);
      }
    });
    setActiveEventTypes(types);
  }, [storeEvents, calendarPermission]);
  

  const {
    selectedEvents,
    newEventTitle,
    setNewEventTitle,
    newEventTime,
    setNewEventTime,
    selectedType,
    setSelectedType,
    notifyOnDay,
    setNotifyOnDay,
    notifyBefore,
    setNotifyBefore,
    notifyBeforeTime,
    setNotifyBeforeTime,
    editingEvent,
    handleAddEvent,
    handleEditEvent,
    handleDeleteEvent,
    resetForm,
  } = useCalendarEvents(selectedDate);

  const {
    isEventModalVisible,
    isViewEventModalVisible,
    debugModalVisible,
    debugData,
    openEventModal,
    openViewEventModal,
    closeEventModals,
    openDebugModal,
    closeDebugModal,
  } = useCalendarModals();

  useEffect(() => {
    const today = new Date();
    today.setDate(1);
    
    // Set up months - now showing 6 months instead of 12
    const monthArr = [];
    for (let i = 0; i < 6; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      monthArr.push(d);
    }
    setMonths(monthArr);
    
    // Set up weeks - starting from current week
    const weekArr = [];
    const currentWeekStart = startOfWeek(new Date());
    for (let i = 0; i < 8; i++) { // Show current week + 7 future weeks
      weekArr.push(addWeeks(currentWeekStart, i));
    }
    setWeeks(weekArr);
  }, []);

  const handleDayPress = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (date < today) {
      showToast("You cant add events in the past silly!", "error");
      return;
    }
    setSelectedDate(date);
    const dateKey = date.toISOString().split("T")[0];
    const dayEvents = events.filter((event) => event.date === dateKey);
    if (dayEvents.length > 0) {
      openViewEventModal();
    } else {
      resetForm();
      openEventModal();
    }
  };
  
  const isIpadDevice = isIpad();
  const isMobile = !isWeb && !isIpadDevice;

  useEffect(() => {
    if (isWeb || isIpadDevice) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [webColumnCount, viewMode]);

  const styles = getCalendarStyles(webColumnCount);

  return (
    <View style={[
      styles.container, 
      isDark? { backgroundColor: '#000' }: { backgroundColor: '#f9f9f9' }
    ]}>
      {!isWeb && activeEventTypes.length > 0 && (
        <BlurView 
          intensity={isWeb? 2 : isDark ? 15 : 30}
          tint={isDark ? 'dark' : 'light'}
        >
          <Legend isDark={isDark} eventTypes={activeEventTypes} />
        </BlurView>
      )}
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {isWeb ? (
          <View style={[
            styles.webMonthsContainer,
            isWeb && webColumnCount === 2 && { justifyContent: 'center' }
          ]}>
            {months.map((date, index) => (
              <View
                key={index}
                style={[
                  styles.webMonthWrapper,
                  isWeb && { 
                    width: webColumnCount === 3 ? '30%' : 
                           webColumnCount === 2 ? '45%' : '80%' 
                  },
                  isIpadDevice && {
                    width: webColumnCount === 2 ? '49%' : '94%',
                    margin: webColumnCount === 2 ? '0.5%' : '3%'
                  }
                ]}
              >
                <Month 
                  date={date}
                  events={combinedEvents}
                  onDayPress={handleDayPress}
                  isDark={isDark}
                  primaryColor={primaryColor}
                  webColumnCount={webColumnCount}
                />
              </View>
            ))}
          </View>
        ) : isIpadDevice ? (
          viewMode === 'week' ? (
            weeks.map((weekStart, index) => (
              <Week
                key={index}
                startDate={weekStart}
                events={combinedEvents}
                onDayPress={handleDayPress}
                isDark={isDark}
                primaryColor={primaryColor}
              />
            ))
          ) : (
            <View style={[
              styles.webMonthsContainer,
              webColumnCount === 2 && { justifyContent: 'center' }
            ]}>
              {months.map((date, index) => (
                <View
                  key={index}
                  style={[
                    styles.webMonthWrapper,
                    { 
                      width: webColumnCount === 2 ? '49%' : '94%',
                      margin: webColumnCount === 2 ? '0.5%' : '3%'
                    }
                  ]}
                >
                  <Month 
                    date={date}
                    events={combinedEvents}
                    onDayPress={handleDayPress}
                    isDark={isDark}
                    primaryColor={primaryColor}
                    webColumnCount={webColumnCount}
                  />
                </View>
              ))}
            </View>
          )
        ) : (
          isMobile && viewMode === 'week' ? (
            weeks.map((weekStart, index) => (
              <Week
                key={index}
                startDate={weekStart}
                events={combinedEvents}
                onDayPress={handleDayPress}
                isDark={isDark}
                primaryColor={primaryColor}
              />
            ))
          ) : (
            months.map((date, index) => (
              <Month
                key={index}
                date={date}
                events={combinedEvents} 
                onDayPress={handleDayPress}
                isDark={isDark}
                primaryColor={primaryColor}
                webColumnCount={1}
              />
            ))
          )
        )}
      </ScrollView>

      <EventModal
        isEventModalVisible={isEventModalVisible}
        isViewEventModalVisible={isViewEventModalVisible}
        selectedDate={selectedDate}
        selectedEvents={selectedEvents}
        newEventTitle={newEventTitle}
        setNewEventTitle={setNewEventTitle}
        newEventTime={newEventTime}
        setNewEventTime={setNewEventTime}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        notifyOnDay={notifyOnDay}
        setNotifyOnDay={setNotifyOnDay}
        notifyBefore={notifyBefore}
        setNotifyBefore={setNotifyBefore}
        notifyBeforeTime={notifyBeforeTime}
        setNotifyBeforeTime={setNotifyBeforeTime}
        editingEvent={editingEvent}
        handleAddEvent={handleAddEvent}
        handleEditEvent={handleEditEvent} 
        handleDeleteEvent={handleDeleteEvent}
        resetForm={resetForm}  
        closeEventModals={closeEventModals}
        openEventModal={openEventModal}
        isDark={isDark}
        primaryColor={primaryColor}
      />


    </View>
  );
}
