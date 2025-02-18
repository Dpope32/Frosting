import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore';
import { useUserStore } from '@/store/UserStore';
import { useToastStore } from '@/store/ToastStore';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { Plus } from '@tamagui/lucide-icons';
import { EventPreview } from '@/components/calendar/EventPreview';
import { Month } from '@/components/calendar/Month';
import { Legend } from '@/components/calendar/Legend';

const parseTimeString = (timeStr: string): string => {
  const parts = timeStr.split(' ');
  if (parts.length !== 2) return timeStr;
  let [hours, minutes] = parts[0].split(':');
  const modifier = parts[1].toUpperCase();
  if (modifier === 'PM' && hours !== '12') hours = String(parseInt(hours, 10) + 12);
  if (modifier === 'AM' && hours === '12') hours = '00';
  return `${hours.padStart(2, '0')}:${minutes}`;
};

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { events, addEvent, updateEvent, deleteEvent, syncBirthdays } = useCalendarStore();
  const { showToast } = useToastStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isViewEventModalVisible, setIsViewEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventTime, setNewEventTime] = useState(() => {
    const now = new Date();
    const minutes = Math.round(now.getMinutes() / 30) * 30;
    now.setMinutes(minutes, 0, 0);
    return now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
  });
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [selectedType, setSelectedType] = useState<CalendarEvent['type']>('personal');
  const scrollViewRef = useRef<ScrollView>(null);
  const [months, setMonths] = useState<Date[]>([]);
  const [debugModalVisible, setDebugModalVisible] = useState(false);
  const [debugData, setDebugData] = useState<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    upcomingEvents: { title: string; date: string; type: string }[];
  } | null>(null);

  useEffect(() => {
    syncBirthdays();
    const today = new Date();
    today.setDate(1);
    const arr = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(today.getFullYear(), today.getMonth() + i, 1);
      arr.push(d);
    }
    setMonths(arr);
  }, []);

  useEffect(() => {
    setTimeout(() => {
      if (scrollViewRef.current) {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).getDay();
        const approximateRow = Math.floor((now.getDate() + startOfMonth) / 7);
        const approximateCellHeight = 50;
        const offset = approximateRow * approximateCellHeight;
        scrollViewRef.current.scrollTo({ y: offset, animated: false });
      }
    }, 300);
  }, [months]);

  const handleDayPress = (date: Date) => {
    setSelectedDate(date);
    const dateKey = date.toISOString().split('T')[0];
    const dayEvents = events.filter((event) => event.date === dateKey);
    if (dayEvents.length > 0) {
      setSelectedEvents(dayEvents);
      setIsViewEventModalVisible(true);
    } else {
      setNewEventTitle('');
      setNewEventDescription('');
      setEditingEvent(null);
      setSelectedType('personal');
      setIsEventModalVisible(true);
    }
  };

  const handleAddEvent = () => {
    if (selectedDate && newEventTitle.trim()) {
      if (editingEvent) {
        if (editingEvent.type === 'birthday') return;
        updateEvent(editingEvent.id, {
          title: newEventTitle.trim(),
          time: parseTimeString(newEventTime),
          type: editingEvent.type,
        });
      } else {
        addEvent({
          date: selectedDate.toISOString().split('T')[0],
          title: newEventTitle.trim(),
          type: selectedType,
          description: '',
          time: parseTimeString(newEventTime),
        });
      }
      setIsEventModalVisible(false);
      setNewEventTitle('');
      setNewEventDescription('');
      setEditingEvent(null);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
  };

  const handleEditEvent = (event: CalendarEvent) => {
    if (event.type === 'birthday') return;
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description);
    setIsViewEventModalVisible(false);
    setIsEventModalVisible(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    const event = selectedEvents.find((e) => e.id === eventId);
    if (event?.type === 'birthday') return;
    deleteEvent(eventId);
    if (selectedEvents.length === 1) {
      setIsViewEventModalVisible(false);
    } else {
      setSelectedEvents(selectedEvents.filter((event) => event.id !== eventId));
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  };

  return (
    <View style={styles.container}>
      <Legend isDark={isDark} />
      <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
        {months.map((date, index) => (
          <Month
            key={index}
            date={date}
            events={events}
            onDayPress={handleDayPress}
            isDark={isDark}
            primaryColor={primaryColor}
          />
        ))}
      </ScrollView>
      <Modal
        visible={isViewEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsViewEventModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.headerRow}>
                <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Events for {selectedDate?.toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={[styles.addEventButton, { backgroundColor: primaryColor }]}
                  onPress={() => {
                    setIsViewEventModalVisible(false);
                    setIsEventModalVisible(true);
                  }}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.eventsScrollView}>
              {selectedEvents.map((event) => (
                <EventPreview
                  key={event.id}
                  event={event}
                  onEdit={() => handleEditEvent(event)}
                  onDelete={() => handleDeleteEvent(event.id)}
                  isDark={isDark}
                  primaryColor={primaryColor}
                />
              ))}
            </ScrollView>
            <View style={styles.bottomButtonContainer}>
              <TouchableOpacity
                style={[styles.bigCloseButton, { backgroundColor: primaryColor }]}
                onPress={() => setIsViewEventModalVisible(false)}
              >
                <Text style={styles.bigCloseButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setIsEventModalVisible(false);
          setEditingEvent(null);
          setNewEventTitle('');
          setNewEventDescription('');
        }}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                {editingEvent ? 'Edit Event' : 'Add Event'} for {selectedDate?.toLocaleDateString()}
              </Text>
            </View>
            <ScrollView style={styles.formScrollView}>
              <View style={styles.formGroup}>
                <TextInput
                  style={[styles.input, { color: isDark ? '#ffffff' : '#000000' }]}
                  placeholder="Event Title"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />
                <TextInput
                  style={[styles.input, { color: isDark ? '#ffffff' : '#000000' }]}
                  placeholder="Event Time (CT)"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTime}
                  onChangeText={setNewEventTime}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.typeSelector}>
                  {['personal', 'work', 'family'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        styles.typeButton,
                        { backgroundColor: type === selectedType ? primaryColor : isDark ? '#333333' : '#f0f0f0' },
                      ]}
                      onPress={() => setSelectedType(type as CalendarEvent['type'])}
                    >
                      <Text
                        style={[
                          styles.typeButtonText,
                          { color: type === selectedType ? '#ffffff' : isDark ? '#ffffff' : '#000000' },
                        ]}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </ScrollView>
            <View style={styles.bottomButtonContainer}>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.bigActionButton, styles.cancelButton]}
                  onPress={() => {
                    setIsEventModalVisible(false);
                    setEditingEvent(null);
                    setNewEventTitle('');
                    setNewEventDescription('');
                  }}
                >
                  <Text style={styles.bigButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.bigActionButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddEvent}
                >
                  <Text style={styles.bigButtonText}>
                    {editingEvent ? 'Update' : 'Add'} Event
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
      <View style={{ position: 'absolute', bottom: 32, right: 24, zIndex: 1000 }}>
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: primaryColor }]}
          onPress={() => {
            showToast('Please select a day to add an event', 'info');
          }}
        >
          <Plus size={24} color="white" />
        </TouchableOpacity>
      </View>
      <View style={{ position: 'absolute', bottom: 32, left: 24, zIndex: 1000 }}>
        <TouchableOpacity
          style={[styles.debugButton, { backgroundColor: '#666666' }]}
          onPress={() => {
            const store = useCalendarStore.getState();
            const info = {
              totalEvents: store.events.length,
              eventsByType: store.events.reduce((acc, event) => {
                const type = event.type || 'personal';
                acc[type] = (acc[type] || 0) + 1;
                return acc;
              }, { personal: 0, work: 0, family: 0, birthday: 0, bill: 0 }),
              upcomingEvents: store.events
                .filter((event) => new Date(event.date) >= new Date())
                .slice(0, 5)
                .map((event) => ({
                  title: event.title,
                  date: event.date,
                  type: event.type || 'personal',
                })),
            };
            setDebugData(info);
            setDebugModalVisible(true);
          }}
        >
          <MaterialIcons name="bug-report" size={24} color="white" />
        </TouchableOpacity>
      </View>
      <Modal visible={debugModalVisible} transparent animationType="slide">
        <View style={styles.debugModalContainer}>
          <View style={[styles.debugModalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <Text style={[styles.debugModalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              Calendar Analytics
            </Text>
            <ScrollView style={styles.debugScroll}>
              {debugData && (
                <>
                  <View style={styles.debugRow}>
                    <Text style={[styles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                      Total Events:
                    </Text>
                    <Text style={[styles.debugValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                      {debugData.totalEvents}
                    </Text>
                  </View>
                  <View style={styles.debugRow}>
                    <Text style={[styles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                      Events By Type:
                    </Text>
                  </View>
                  {Object.entries(debugData.eventsByType).map(([type, count]) => (
                    <View style={styles.debugRow} key={type}>
                      <Text style={[styles.debugKey, { color: isDark ? '#ffffff' : '#000000' }]}>
                        {type}:
                      </Text>
                      <Text style={[styles.debugValue, { color: isDark ? '#ffffff' : '#000000' }]}>
                        {count}
                      </Text>
                    </View>
                  ))}
                  <View style={styles.debugRow}>
                    <Text style={[styles.debugLabel, { color: isDark ? '#ffffff' : '#000000' }]}>
                      Upcoming Events:
                    </Text>
                  </View>
                  {debugData &&
                    debugData.upcomingEvents.map((event, idx) => (
                      <View style={styles.debugEventRow} key={idx}>
                        <Text style={[styles.debugEventTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                          {event.title}
                        </Text>
                        <Text style={[styles.debugEventDate, { color: isDark ? '#ffffff' : '#000000' }]}>
                          {event.date}
                        </Text>
                        <Text style={[styles.debugEventType, { color: isDark ? '#ffffff' : '#000000' }]}>
                          {event.type}
                        </Text>
                      </View>
                    ))}
                </>
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.debugCloseButton, { backgroundColor: '#666666' }]}
              onPress={() => setDebugModalVisible(false)}
            >
              <Text style={styles.debugCloseButtonText}>OK</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
  },
  debugButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  modalContent: {
    width: '100%',
    minHeight: '50%',
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  eventsScrollView: {
    flex: 1,
    padding: 20,
    minHeight: 200,
  },
  formScrollView: {
    flex: 1,
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#444',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    fontSize: 16,
  },
  bottomButtonContainer: {
    width: '100%',
    padding: 12,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'flex-end',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bigCloseButton: {
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: 'rgba(200,200,200,1)',
    width: '50%',
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCloseButtonText: {
    color: 'rgba(255,255,255,1)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  formGroup: {
    gap: 12,
  },
  typeSelector: {
    flexGrow: 0,
    marginBottom: 16,
  },
  typeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  typeButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  bigActionButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  addEventButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  debugModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 16,
  },
  debugModalContent: {
    width: '100%',
    maxHeight: '80%',
    borderRadius: 20,
    elevation: 5,
    overflow: 'hidden',
    padding: 20,
  },
  debugModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  debugScroll: {
    maxHeight: 300,
  },
  debugRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  debugLabel: {
    fontWeight: '600',
    marginRight: 8,
  },
  debugKey: {
    marginLeft: 16,
  },
  debugValue: {
    marginLeft: 8,
  },
  debugEventRow: {
    marginLeft: 16,
    marginBottom: 8,
  },
  debugEventTitle: {
    fontWeight: '600',
  },
  debugEventDate: {},
  debugEventType: {},
  debugCloseButton: {
    marginTop: 16,
    alignSelf: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  debugCloseButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});
