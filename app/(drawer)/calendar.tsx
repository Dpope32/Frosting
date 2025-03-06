import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, ScrollView, Platform } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { useCalendarStore } from '@/store/CalendarStore';
import { Plus } from '@tamagui/lucide-icons';
import { Month } from '@/components/calendar/Month';
import { Legend } from '@/components/calendar/Legend';
import { EventModal } from '@/components/calendar/EventModal';
import { CalendarAnalytics } from '@/components/calendar/CalendarAnalytics';
import { DebugTools } from '@/components/calendar/DebugTools';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { useCalendarModals } from '@/hooks/useCalendarModals';
import { calendarStyles } from '@/components/calendar/CalendarStyles';
import { getUSHolidays } from '@/services/holidayService';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { events } = useCalendarStore();
  const { showToast } = useToastStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [months, setMonths] = useState<Date[]>([]);

  const { events: storeEvents } = useCalendarStore();
  const [combinedEvents, setCombinedEvents] = useState(storeEvents);
  
  // Combine store events with holidays
  useEffect(() => {
    const currentYear = new Date().getFullYear();
    const holidays = [
      ...getUSHolidays(currentYear), 
      ...getUSHolidays(currentYear + 1)
    ];
    
    setCombinedEvents([...storeEvents, ...holidays]);
  }, [storeEvents]);

  // Custom hooks
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

  // Initialize months
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

  // Handle day press
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
  

  return (
    <View style={calendarStyles.container}>
      <Legend isDark={isDark} />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {Platform.OS === 'web' ? (
          <View style={calendarStyles.webMonthsContainer}>
            {months.map((date, index) => (
              <View key={index} style={calendarStyles.webMonthWrapper}>
                <Month
                  date={date}
                  events={combinedEvents} 
                  onDayPress={handleDayPress}
                  isDark={isDark}
                  primaryColor={primaryColor}
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
            />
          ))
        )}
      </ScrollView>

      {/* Event Modals */}
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


      {/* Calendar Analytics Modal */}
      <CalendarAnalytics
        visible={debugModalVisible}
        onClose={closeDebugModal}
        debugData={debugData}
        isDark={isDark}
      />

      {/* Add Event Button */}
      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 1000 }}>
        <TouchableOpacity
          style={[calendarStyles.debugButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            showToast('Please select a day to add an event', 'info');
          }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>

      {/* Debug Tools */}
      <DebugTools openDebugModal={openDebugModal} isDev={__DEV__} />
    </View>
  );
}
