import React, { useState, useEffect, useRef } from 'react';
import { View, ScrollView, LayoutAnimation, UIManager, Platform } from 'react-native';
import { isWeb } from 'tamagui';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { useCalendarViewStore } from '@/store/CalendarViewStore';
import { useToastStore } from '@/store/ToastStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { Month } from '@/components/calendar/Month';
import { Legend } from '@/components/calendar/Legend';
import { EventModal } from '@/components/calendar/EventModal';
import { CalendarAnalytics } from '@/components/calendar/CalendarAnalytics';
import { DebugTools } from '@/components/calendar/DebugTools';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarModals } from '@/hooks/useCalendarModals';
import { calendarStyles } from '@/components/calendar/CalendarStyles';
import { getUSHolidays } from '@/services/holidayService';
import { isIpad } from '@/utils/deviceUtils';
import { BlurView } from 'expo-blur';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { webColumnCount } = useCalendarViewStore(); 
  const { events } = useCalendarStore();
  const { showToast } = useToastStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [months, setMonths] = useState<Date[]>([]);

  const { events: storeEvents } = useCalendarStore();
  const [combinedEvents, setCombinedEvents] = useState(storeEvents);
  const [activeEventTypes, setActiveEventTypes] = useState<string[]>([]);
  
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const holidays = [
      ...getUSHolidays(currentYear), 
      ...getUSHolidays(currentYear + 1)
    ];
    
    const allEvents = [...storeEvents, ...holidays];
    setCombinedEvents(allEvents);
    
    // Extract unique event types from combined events
    const types: string[] = [];
    allEvents.forEach(event => {
      if (event.type && !types.includes(event.type)) {
        types.push(event.type);
      }
    });
    setActiveEventTypes(types);
  }, [storeEvents]);
  

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
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      arr.push(d);
    }
    setMonths(arr);
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

  useEffect(() => {
    if (isWeb || isIpadDevice) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    }
  }, [webColumnCount]);

  return (
    <View style={[
      calendarStyles.container, 
      isDark && { backgroundColor: '#121212' }
    ]}>
      {activeEventTypes.length > 0 && (
        <BlurView 
          intensity={isDark ? 15 : 30}
          tint={isDark ? 'dark' : 'light'}
        >
          <Legend isDark={isDark} eventTypes={activeEventTypes} />
        </BlurView>
      )}
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {isWeb || isIpadDevice ? (
          <View style={[
            calendarStyles.webMonthsContainer,
            isWeb && webColumnCount === 2 && { justifyContent: 'center' }
          ]}>
            {months.map((date, index) => (
              <View
                key={index}
                style={[
                  calendarStyles.webMonthWrapper,
                  isWeb && { 
                    width: webColumnCount === 3 ? '33%' : 
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
        ) : (
          months.map((date, index) => (
            <Month
              key={index}
              date={date}
              events={combinedEvents} 
              onDayPress={handleDayPress}
              isDark={isDark}
              primaryColor={primaryColor}
              webColumnCount={webColumnCount}
            />
          ))
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

      <CalendarAnalytics visible={debugModalVisible}  onClose={closeDebugModal} debugData={debugData} isDark={isDark}/>
      <DebugTools openDebugModal={openDebugModal} isDev={__DEV__} />
    </View>
  );
}
