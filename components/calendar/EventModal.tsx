import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CalendarEvent } from '@/store/CalendarStore';
import { EventPreview } from './EventPreview';
import { calendarStyles } from './CalendarStyles';

interface EventModalProps {
  // Modal visibility
  isEventModalVisible: boolean;
  isViewEventModalVisible: boolean;
  
  // Event data
  selectedDate: Date | null;
  selectedEvents: CalendarEvent[];
  newEventTitle: string;
  setNewEventTitle: (title: string) => void;
  newEventTime: string;
  setNewEventTime: (time: string) => void;
  selectedType: CalendarEvent['type'];
  setSelectedType: (type: CalendarEvent['type']) => void;
  editingEvent: CalendarEvent | null;
  
  // Event handlers
  handleAddEvent: () => void;
  handleEditEvent: (event: CalendarEvent) => void;
  handleDeleteEvent: (eventId: string) => void;
  
  // Modal handlers
  closeEventModals: () => void;
  openEventModal: () => void;
  
  // Theme
  isDark: boolean;
  primaryColor: string;
}

export const EventModal: React.FC<EventModalProps> = ({
  // Modal visibility
  isEventModalVisible,
  isViewEventModalVisible,
  
  // Event data
  selectedDate,
  selectedEvents,
  newEventTitle,
  setNewEventTitle,
  newEventTime,
  setNewEventTime,
  selectedType,
  setSelectedType,
  editingEvent,
  
  // Event handlers
  handleAddEvent,
  handleEditEvent,
  handleDeleteEvent,
  
  // Modal handlers
  closeEventModals,
  openEventModal,
  
  // Theme
  isDark,
  primaryColor,
}) => {
  return (
    <>
      {/* View Events Modal */}
      <Modal
        visible={isViewEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => closeEventModals()}
      >
        <View style={calendarStyles.modalContainer}>
          <View style={[calendarStyles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={calendarStyles.modalHeader}>
              <View style={calendarStyles.headerRow}>
                <Text style={[calendarStyles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                  Events for {selectedDate?.toLocaleDateString()}
                </Text>
                <TouchableOpacity
                  style={[calendarStyles.addEventButton, { backgroundColor: primaryColor }]}
                  onPress={openEventModal}
                >
                  <Ionicons name="add" size={24} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={calendarStyles.eventsScrollView}>
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
            <View style={calendarStyles.bottomButtonContainer}>
              <TouchableOpacity
                style={[calendarStyles.bigCloseButton, { backgroundColor: primaryColor }]}
                onPress={closeEventModals}
              >
                <Text style={calendarStyles.bigCloseButtonText}>CLOSE</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add/Edit Event Modal */}
      <Modal
        visible={isEventModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => closeEventModals()}
      >
        <View style={calendarStyles.modalContainer}>
          <View style={[calendarStyles.modalContent, { backgroundColor: isDark ? '#1e1e1e' : '#ffffff' }]}>
            <View style={calendarStyles.modalHeader}>
              <Text style={[calendarStyles.modalTitle, { color: isDark ? '#ffffff' : '#000000' }]}>
                {editingEvent ? 'Edit Event' : 'Add Event'} for {selectedDate?.toLocaleDateString()}
              </Text>
            </View>
            <ScrollView style={calendarStyles.formScrollView}>
              <View style={calendarStyles.formGroup}>
                <TextInput
                  style={[calendarStyles.input, { color: isDark ? '#ffffff' : '#000000' }]}
                  placeholder="Event Title"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTitle}
                  onChangeText={setNewEventTitle}
                />
                <TextInput
                  style={[calendarStyles.input, { color: isDark ? '#ffffff' : '#000000' }]}
                  placeholder="Event Time (CT)"
                  placeholderTextColor={isDark ? '#888888' : '#666666'}
                  value={newEventTime}
                  onChangeText={setNewEventTime}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={calendarStyles.typeSelector}>
                  {['personal', 'work', 'family'].map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        calendarStyles.typeButton,
                        { backgroundColor: type === selectedType ? primaryColor : isDark ? '#333333' : '#f0f0f0' },
                      ]}
                      onPress={() => setSelectedType(type as CalendarEvent['type'])}
                    >
                      <Text
                        style={[
                          calendarStyles.typeButtonText,
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
            <View style={calendarStyles.bottomButtonContainer}>
              <View style={calendarStyles.modalButtons}>
                <TouchableOpacity
                  style={[calendarStyles.bigActionButton, calendarStyles.cancelButton]}
                  onPress={closeEventModals}
                >
                  <Text style={calendarStyles.bigButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[calendarStyles.bigActionButton, { backgroundColor: primaryColor }]}
                  onPress={handleAddEvent}
                >
                  <Text style={calendarStyles.bigButtonText}>
                    {editingEvent ? 'Update' : 'Add'} Event
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};
