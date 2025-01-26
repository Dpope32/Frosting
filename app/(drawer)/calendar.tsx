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
  const { events, addEvent, updateEvent, deleteEvent } = useCalendarStore();
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
      setIsEventModalVisible(true);
    }
  };

  const handleAddEvent = () => {
    if (selectedDate && newEventTitle.trim()) {
      if (editingEvent) {
        updateEvent(editingEvent.id, {
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
        });
      } else {
        addEvent({
          date: selectedDate.toISOString().split('T')[0],
          title: newEventTitle.trim(),
          description: newEventDescription.trim(),
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
    setEditingEvent(event);
    setNewEventTitle(event.title);
    setNewEventDescription(event.description);
    setIsViewEventModalVisible(false);
    setIsEventModalVisible(true);
  };

  const handleDeleteEvent = (eventId: string) => {
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
            <Text style={[styles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
              {editingEvent ? 'Edit Event' : 'Add Event'} for {selectedDate?.toLocaleDateString()}
            </Text>
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#000000' }]}
              placeholder="Event Title"
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={newEventTitle}
              onChangeText={setNewEventTitle}
            />
            <TextInput
              style={[styles.input, { color: isDark ? '#ffffff' : '#000000' }]}
              placeholder="Event Description"
              placeholderTextColor={isDark ? '#888888' : '#666666'}
              value={newEventDescription}
              onChangeText={setNewEventDescription}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.button, styles.cancelButton]}
                onPress={() => {
                  setIsEventModalVisible(false);
                  setEditingEvent(null);
                  setNewEventTitle('');
                  setNewEventDescription('');
                }}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.button, styles.addButton, { backgroundColor: primaryColor }]}
                onPress={handleAddEvent}
              >
                <Text style={styles.buttonText}>{editingEvent ? 'Update' : 'Add'} Event</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
            <TouchableOpacity
              style={[styles.button, styles.closeButton, { backgroundColor: primaryColor }]}
              onPress={() => setIsViewEventModalVisible(false)}
            >
              <Text style={styles.buttonText}>Close</Text>
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
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    borderRadius: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#cccccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    fontSize: 16,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 8,
  },
  cancelButton: {
    backgroundColor: '#666666',
  },
  addButton: {
    backgroundColor: '#4CAF50',
  },
  closeButton: {
    marginVertical: 16,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '500',
    marginVertical: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  addEventButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
