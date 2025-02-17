import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import * as Haptics from 'expo-haptics';
import { useColorScheme } from '@/hooks/useColorScheme';
import { CalendarEvent, useCalendarStore } from '@/store/CalendarStore';
import { useUserStore } from '@/store/UserStore';
import { Ionicons } from '@expo/vector-icons';
import { EventPreview } from '@/components/calendar/EventPreview';
import { Month } from '@/components/calendar/Month';

export default function CalendarScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primaryColor = useUserStore((state) => state.preferences.primaryColor);
  const { events, addEvent, updateEvent, deleteEvent, syncBirthdays } = useCalendarStore();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isEventModalVisible, setIsEventModalVisible] = useState(false);
  const [isViewEventModalVisible, setIsViewEventModalVisible] = useState(false);
  const [newEventTitle, setNewEventTitle] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<CalendarEvent[]>([]);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const [months, setMonths] = useState<Date[]>([]);

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
      setIsEventModalVisible(true);
    }
  };

  const handleAddEvent = () => {
    if (selectedDate && newEventTitle.trim()) {
      if (editingEvent) {
        if (editingEvent.type === 'birthday') return;
        updateEvent(editingEvent.id, {
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
        });
      } else {
        addEvent({
          date: selectedDate.toISOString().split('T')[0],
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
          type: 'regular',
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
    const event = selectedEvents.find(e => e.id === eventId);
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

      {/* View Events Modal */}
      <Modal
        visible={isViewEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setIsViewEventModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={styles.modalHeader}>
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
                style={styles.bigCloseButton}
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
              <TextInput
                style={[styles.input, { color: isDark ? '#ffffff' : '#000000' }]}
                placeholder="Event Title"
                placeholderTextColor={isDark ? '#888888' : '#666666'}
                value={newEventTitle}
                onChangeText={setNewEventTitle}
              />
              <TextInput
                style={[styles.input, { color: isDark ? '#ffffff' : '#000000', minHeight: 100 }]}
                placeholder="Event Description"
                placeholderTextColor={isDark ? '#888888' : '#666666'}
                value={newEventDescription}
                onChangeText={setNewEventDescription}
                multiline
              />
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 100,
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
    display: 'flex',
    flexDirection: 'column',
  },
  modalHeader: {
    padding: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  eventsScrollView: {
    flex: 1,
    padding: 20,
    minHeight: 200, // Ensure some minimum space for content
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
    backgroundColor: '#1e1e1e',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  bigCloseButton: {
    backgroundColor: 'rgba(0,0,0,0.25)',
    paddingVertical: 12,
    borderRadius: 8,
    borderColor: 'rgba(200,200,200,1)',
    width: '50%',
    borderWidth: 1,
    color:  'rgba(255,0,0,1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigActionButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bigCloseButtonText: {
    color:  'rgba(255,255,255,1)',
    fontSize: 14,
    fontWeight: 'bold',
    letterSpacing: 1,
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
});